package ch.datatrans.examples.googlepay;

import ch.datatrans.examples.googlepay.client.DatatransClient;
import ch.datatrans.examples.googlepay.domain.PaymentResponse;
import ch.datatrans.examples.googlepay.domain.PaymentSubmissionRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;


@Controller
public class ApplicationController {

    private DatatransClient datatransClient;

    @Autowired
    public ApplicationController(DatatransClient datatransClient){
        this.datatransClient = datatransClient;
    }

    @Value("${datatrans.merchantId}")
    private String merchantId;

    @RequestMapping(value = "/", method = RequestMethod.GET)
    private String index(Model model){
        model.addAttribute("merchantId", merchantId);
        return "index";
    }

    @RequestMapping(value = "/submitPayment", method = RequestMethod.POST)
    private ResponseEntity<PaymentResponse> submitPayment(@RequestBody PaymentSubmissionRequest paymentSubmissionRequest){
        PaymentResponse paymentResponse = datatransClient.authorize(paymentSubmissionRequest);
        return  ResponseEntity.ok(paymentResponse);
    }
}
