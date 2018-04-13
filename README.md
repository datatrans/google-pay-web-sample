# Google Pay Web Sample App
Sample project that shows how to integrate Google Pay with Datatrans

## Getting Started

Google Pay allows merchants to collect payments with the Payment Request API. It enables merchants to recieve encrypted payment information which can be forwarded to their Payment Processor. This Guide is intended for merchants who would like to integrate Google Pay with Datatrans. For more Information on Google Pay visit: https://pay.google.com/about/

(Optional) Please also read the Google Pay Guide for Developers to understand flows and technology: 
- [Overview](https://developers.google.com/pay/api/)
- [Guide for the Web](https://developers.google.com/pay/api/web/setup)

### Prerequisites

1. Java installed on your local dev system
2. Maven installed on your local dev system
3. An Android Device Running Chrome > 59 and Google Play services version 11.4.x or higher
4. A google account that has a payment method installed (https://support.google.com/payments/answer/6220309)
5. Some basic experience with Spring Boot
6. Some understanding of Google Pay and Payment Request API

### Sample Application Flow

This sample application demonstrates following parts of collecting a payment with Google Pay. 

1. Determine if the browser can use Google Pay and if there are payment methods available.
2. If so create a payment request object
3. Populate the payment request
4. Request payment from the user
5. Forward the encrypted payment data to the "back-end"
6. Create an xml request to authorize the transaction with Datatrans
7. Forward the Google Pay data with the xml request to the Datatrans XML API
8. Display the results. 

### Installing

1. Clone the repository
 ```zsh
    $ git clone git@github.com:datatrans/google-pay-web-sample.git
    $ cd google-pay-web-sample
```
2. Open it with your favorite IDE/ Texteditor
3. Install the project

```
mvn clean install
```

## Running the app
This sample app uses Spring Boot and Embedded Tomcat. The server is listening on port 8080. 

To run the app execute the main class GooglepayApplication.java. 

Open http://localhost:8080/ in Google Chrome.

### Making the app accessible for your phone

Since currently Google Pay is not yet available for Chrome Desktop you need to make this web app available for your android device. A tool to expose your local webserver through a public URL is for example [Ngrok] (https://ngrok.com/). 

## Remarks
- This is sample code never ever use this code in production! 


## Appendix 
[Datatrans APIs](https://www.datatrans.ch/en/technology_apis/technical-documentation)

## Built With

* [Spring Boot ](https://projects.spring.io/spring-boot/) 
* [Maven](https://maven.apache.org/) 
