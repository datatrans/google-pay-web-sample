package ch.datatrans.examples.googlepay.client;

import ch.datatrans.examples.googlepay.domain.PaymentResponse;
import ch.datatrans.examples.googlepay.domain.PaymentSubmissionRequest;
import org.apache.velocity.Template;
import org.apache.velocity.VelocityContext;
import org.apache.velocity.app.VelocityEngine;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.xml.sax.InputSource;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathFactory;
import java.io.StringReader;
import java.io.StringWriter;
import java.util.Properties;


@Component
public final class DatatransClient {

    private final VelocityEngine velocityEngine;
    private final RestTemplate restTemplate;
    private final DatatransConfig datatransConfig;
    private static final Logger logger = LoggerFactory.getLogger(DatatransClient.class);


    @Autowired
    public DatatransClient(RestTemplate restTemplate, DatatransConfig datatransConfig) {
        this.restTemplate = restTemplate;
        this.datatransConfig = datatransConfig;
        velocityEngine = new VelocityEngine();
        Properties properties = new Properties();
        properties.setProperty("resource.loader", "file");
        properties.setProperty("file.resource.loader.class", "org.apache.velocity.runtime.resource.loader.ClasspathResourceLoader");
        velocityEngine.init(properties);
    }

    public PaymentResponse authorize(PaymentSubmissionRequest paymentSubmissionRequest) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_XML);
        HttpEntity<String> request = new HttpEntity<>(getRequestPayload(paymentSubmissionRequest), headers);
        ResponseEntity<String> response = restTemplate.postForEntity(datatransConfig.getEndpoint(), request, String.class);
        String responseContent = response.getBody();
        PaymentResponse paymentResponse = new PaymentResponse();

        if(response.getStatusCode() == HttpStatus.OK){
            try{
                DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
                DocumentBuilder db = dbf.newDocumentBuilder();
                Document document = db.parse(new InputSource(new StringReader(responseContent)));
                Node transactionElement = document.getElementsByTagName("body").item(0);
                Node status = transactionElement.getAttributes().getNamedItem("status");
                if(status!= null && status.getNodeValue() != null && status.getNodeValue().equalsIgnoreCase("accepted")){
                    XPathFactory xpathFactory = XPathFactory.newInstance();
                    XPath xpath = xpathFactory.newXPath();
                    String transactionId = xpath.evaluate("/authorizationService/body/transaction/response/uppTransactionId/.", document);
                        if(transactionId != null){
                            paymentResponse.transactionId = transactionId;
                            paymentResponse.success = true;
                        }else{
                            paymentResponse.success = false;
                            paymentResponse.errorMessage = "TransactionId missing, check the server logs\n ";
                            logger.error("TransactionId missing, response from authorization server: \n " + responseContent);
                        }
                }else{
                    paymentResponse.success = false;
                    paymentResponse.errorMessage = "Failed to authorize transaction,  check the server logs\n ";
                    logger.error("Failed to authorize transaction, response from authorization server: \n " + responseContent);
                }
            }catch (Exception exception) {
                paymentResponse.success = false;
                paymentResponse.errorMessage = "Failed to parse xml response,  check the server logs\n ";
                logger.error("Failed to parse xml response, response from authorization server: \n " + responseContent);
            }
        }else{
            paymentResponse.success = false;
            paymentResponse.errorMessage = "Failed to request payment on datatrans authorize api - response code: "+ response.getStatusCodeValue();
            logger.error("Failed to parse xml response, response from authorization server: \n " + responseContent);
        }
        return paymentResponse;
    }

    private String getRequestPayload(PaymentSubmissionRequest paymentSubmissionRequest) {
        VelocityContext context = new VelocityContext();
        context.put("merchantId", datatransConfig.getMerchantId());
        context.put("sign", datatransConfig.getSign());
        context.put("googlePayData", paymentSubmissionRequest.googlePayData);
        context.put("refno", System.currentTimeMillis());
        context.put("amount", convertToCents(paymentSubmissionRequest.amount));
        context.put("currency", paymentSubmissionRequest.currency);
        Template authorizationServiceTemplate = velocityEngine.getTemplate("velocity/authorization.vm");
        StringWriter writer = new StringWriter();
        authorizationServiceTemplate.merge(context, writer);
        return writer.toString();
    }

    private int convertToCents(String amount){
        double doubleAmount = Double.parseDouble(amount);
        int cents = (int) doubleAmount * 100;
        return cents;

    }

    @Component
    static final class DatatransConfig {

        private final String merchantId;
        private final String sign;
        private final String endpoint;

        DatatransConfig(@Value("${datatrans.merchantId}") String merchantId,
                        @Value("${datatrans.sign}") String sign,
                        @Value("${datatrans.endpoint}") String endpoint) {

            this.merchantId = merchantId;
            this.sign = sign;
            this.endpoint = endpoint;
        }

        public String getMerchantId() {
            return merchantId;
        }

        public String getSign() {
            return sign;
        }

        public String getEndpoint() {
            return endpoint;
        }
    }

}
