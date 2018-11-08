var allowedPaymentMethods = ['PAN_ONLY', 'CRYPTOGRAM_3DS'];
var allowedCardNetworks = ['AMEX', 'DISCOVER', 'JCB', 'MASTERCARD', 'VISA'];
var googlePayClient = new google.payments.api.PaymentsClient({environment: "TEST"});
var paymentDataRequest;

var tokenizationParameters = {
    type: 'PAYMENT_GATEWAY',
    parameters: {
        'gateway': 'datatrans',
        'gatewayMerchantId': merchantId
    }
};

var baseRequest = {
    apiVersion: 2,
    apiVersionMinor: 0
};

var baseCardPaymentMethod = {
    type: 'CARD',
    parameters: {
        allowedAuthMethods: allowedPaymentMethods,
        allowedCardNetworks: allowedCardNetworks,
    }
};

var cardPaymentMethod = $.extend(
    {},
    baseCardPaymentMethod,
    {
        tokenizationSpecification: tokenizationParameters
    }
);

var isReadToPayRequestObject = $.extend({},baseRequest,{allowedPaymentMethods: [baseCardPaymentMethod]});

/**
 * Initialize a Google Pay API client
 *
 * @returns {google.payments.api.PaymentsClient} Google Pay API client
 */
function getGooglePaymentsClient() {
    return (new google.payments.api.PaymentsClient({environment: 'TEST'}));
}

function getGoogleTransactionInfo() {
    var amount = $("#amount").val();
    var currency = $("#currency").val();
    return {
        currencyCode: currency,
        totalPriceStatus: 'FINAL',
        totalPrice: amount
    };
}

function getGooglePaymentDataConfiguration() {
    var paymentDataRequest = $.extend({}, baseRequest);
    paymentDataRequest.allowedPaymentMethods = [cardPaymentMethod];
    paymentDataRequest.merchantInfo = {
        merchantId: '01234567890123456789',
        merchantName: 'Datatrans Web Sample'
    };

    if($("#shippingRequired").is(':checked')){
        paymentDataRequest.shippingAddressRequired = true;
        paymentDataRequest.shippingAddressParameters = {};
    }

    if($("#emailRequired").is(':checked')){
        paymentDataRequest.emailRequired = true;
    }

    var billingAddressParameters ={};

    if($("#phoneRequired").is(':checked')){
        billingAddressParameters.phoneNumberRequired = true;
    }

    if($("#billingAddressRequired").is(':checked')){
        paymentDataRequest.allowedPaymentMethods[0].parameters.billingAddressRequired = true;
        billingAddressParameters.format = "FULL";
    }

    paymentDataRequest.allowedPaymentMethods[0].parameters.billingAddressParameters = billingAddressParameters;

    return paymentDataRequest;
}

function log(message){
    $("#console").append("<p>" + message +"</p>");
}

function buildPaymentRequest() {
    cleanup();
    if(validate()){
        googlePayClient.isReadyToPay(isReadToPayRequestObject)
            .then(function(response) {
                if (!response.result) {
                    log("Client is not supported for GooglePay");
                }else{
                    $("#google-pay-button").removeAttr("disabled");
                    paymentDataRequest = getGooglePaymentDataConfiguration();
                    paymentDataRequest.transactionInfo = getGoogleTransactionInfo();
                    log("Payment request built and button enabled, ready to pay");
                }
            })
            .catch(function(err) {
                console.log(err)
            });
    }

}

function requestPayment(){
    log("Google Pay button clicked - payment request started");
    if(paymentDataRequest != null){
        googlePayClient.loadPaymentData(paymentDataRequest)
            .then(function(paymentData) {
                var requestData = {googlePayData: paymentData.paymentMethodData.tokenizationData.token}
                requestData.currency = paymentDataRequest.transactionInfo.currencyCode;
                requestData.amount = paymentDataRequest.transactionInfo.totalPrice;
                log("Payment request successful, transmitting data to Datatrans");
                $.ajax({
                    type: 'POST',
                    url: '/submitPayment',
                    data: JSON.stringify(requestData),
                    contentType: 'application/json',
                    success: function (data) {
                        if(data.success){
                            $("<p class='success'> Transaction Authorized</p><br>").appendTo("#transactionStatus").fadeIn();
                            $("<p> Transaction ID: " + data.transactionId +"</p><br>").appendTo("#transactionStatus").fadeIn();;
                        }else{
                            $("<p class='failure'> Transaction Not Authorized</p><br>").appendTo("#transactionStatus").fadeIn();;
                            $("<p> Error Message " + data.errorMessage +"</p><br>").appendTo("#transactionStatus").fadeIn();;
                        }

                        $("#google-pay-button").attr("disabled",true);
                        log("Authorization successful");
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                            log("Failed to submit payment data, check developer console");
                            console.error(errorThrown);
                            $("#google-pay-button").attr("disabled",true);
                        }

                });
                paymentDataRequest = null;
            })
            .catch(function(err) {
                log("Failed to collect payment, check developer console");
                console.log(err);
                cleanup();
            });
    }else{
        log("No Payment request available, please build one first.")
    }

}

function cleanup() {
    $("#transactionStatus").empty();
    $("#console").empty();

}

function validate(){
    var amount = $("#amount").val();
    var currency = $("#currency").val();

    if(!amount || amount =="" || amount == undefined){
        log("Amount is mandatory!");
        return false;
    }

    if(!currency || currency =="" || currency == undefined){
        log("Currency is mandatory!")
        return false;
    }

    return true;
}

$("document").ready(function () {
    googlePayClient.isReadyToPay(isReadToPayRequestObject)
        .then(function(response) {
            if (!response.result) {
                $("#info-message").show();
            }
        })
        .catch(function(err) {
            console.log(err)
        });
})