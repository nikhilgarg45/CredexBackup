public with sharing class Amazon_s3 {

    Public static void makeCallToAws(){
     
        Http http=new Http();
        HttpRequest request=new HttpRequest();
        request.setEndpoint('callout:s3/');
        request.setMethod('GET');
        request.setHeader('Content-Type','application/xml');
        HttpResponse response=http.send(request);
        system.debug(response.getstatusCode());
        system.debug(response.getStatus());
        system.debug('response >>>>>>>>>>>>>>>>>>>>>'+response.getbody());
        system.debug('after success');
        if(response.getStatusCode() ==200){
            system.debug('response >>>>>>>>>>>>>>>>>>>>>'+response.getbody());
            system.debug(response.getStatus());
            system.debug(response.getStatusCode());
        }
    }

}