# Google Pay Web Sample App
Sample project that shows how to integrate Google Pay with Datatrans

## Getting Started

Google Pay allows merchants to collect payments with the Payment Request API. It enables merchants to recieve encrypted payment information which can be forwarded to their Payment Processor. This Guide is intended for merchants who would like to integrate Google Pay with Datatrans. For more Information on Google Pay visit: https://pay.google.com/about/

### Prerequisites

1. Java installed on your local dev system
2. Maven installed on your local dev system
3. An Android Device Running Chrome > 59 and Google Play services version 11.4.x or higher
4. A google account that has a payment method installed (https://support.google.com/payments/answer/6220309)
5. Some basic experience with Spring Boot

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


## Built With

* [Spring Boot ](https://projects.spring.io/spring-boot/) 
* [Maven](https://maven.apache.org/) 
