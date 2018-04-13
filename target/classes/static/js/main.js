var allowedPaymentMethods = ['CARD', 'TOKENIZED_CARD'];
var allowedCardNetworks = ['AMEX', 'DISCOVER', 'JCB', 'MASTERCARD', 'VISA'];
var paymentRequest;

/**
 * The Google Pay API response will return an encrypted payment method capable of
 * being charged by a supported gateway after shopper authorization
 */
var tokenizationParameters = {
    tokenizationType: 'PAYMENT_GATEWAY',
    parameters: {
        'gateway': 'datatrans',
        'gatewayMerchantId': merchantId
    }
}

/**
 * Initialize a Google Pay API client
 *
 * @returns {google.payments.api.PaymentsClient} Google Pay API client
 */
function getGooglePaymentsClient() {
    return (new google.payments.api.PaymentsClient({environment: 'TEST'}));
}

function getGooglePayTransactionInfo() {
    var amount = $("#amount").val();
    var currency = $("#currency").val();
    return {
        currencyCode: currency,
        totalPriceStatus: 'FINAL',
        totalPrice: amount
    };
}

function getGooglePaymentDataConfiguration() {
    var paymentDataConfiguration =  {
        // @todo a merchant ID is available for a production environment after approval by Google
        // @see {@link https://developers.google.com/pay/api/web/test-and-deploy|Test and deploy}
        merchantId: '01234567890123456789',
        paymentMethodTokenizationParameters: tokenizationParameters,
        allowedPaymentMethods: allowedPaymentMethods,
        cardRequirements: {
            allowedCardNetworks: allowedCardNetworks
        }
    };

    if($("#shippingRequired").is(':checked')){
            paymentDataConfiguration.shippingAddressRequired = true;
    }

    if($("#emailRequired").is(':checked')){
        paymentDataConfiguration.emailRequired = true;
    }

    if($("#phoneRequired").is(':checked')){
        paymentDataConfiguration.phoneNumberRequired = true;
    }

    if($("#billingAddressRequired").is(':checked')){
        paymentDataConfiguration.cardRequirements.billingAddressRequired = true;
        paymentDataConfiguration.cardRequirements.billingAddressFormat = "FULL"
    }

    return paymentDataConfiguration;
}

function log(message){
    $("#console").append("<p>" + message +"</p>");
}

function buildPaymentRequest() {
    cleanup();
    getGooglePaymentsClient().isReadyToPay({allowedPaymentMethods: allowedPaymentMethods})
        .then(function(response) {
            if (!response.result) {
               log("Client is not supported for GooglePay");
            }else{
                $("#google-pay-button").removeAttr("disabled");
                paymentRequest = getGooglePaymentDataConfiguration();
                paymentRequest.transactionInfo = getGooglePayTransactionInfo();
                log("Payment request built and button enabled, ready to pay");
            }
        })
        .catch(function(err) {
            console.log(err)
        });
}

function requestPayment(){
    log("Google Pay button clicked - payment request started");
    if(paymentRequest != null){
        getGooglePaymentsClient().loadPaymentData(paymentRequest)
            .then(function(paymentData) {
                var requestData = {googlePayData: paymentData.paymentMethodToken.token}
                requestData.currency = paymentRequest.transactionInfo.currencyCode;
                requestData.amount = paymentRequest.transactionInfo.totalPrice;
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
                paymentRequest = null;
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

$("document").ready(function () {
    getGooglePaymentsClient().isReadyToPay({allowedPaymentMethods: allowedPaymentMethods})
        .then(function(response) {
            if (!response.result) {
                $("#info-message").show();
            }
        })
        .catch(function(err) {
            console.log(err)
        });
})