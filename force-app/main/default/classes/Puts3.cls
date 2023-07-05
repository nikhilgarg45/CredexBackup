/******************************************************************************
* Author: Nikhil Garg
* Date: June 21, 2023
* Descpription: AWS Service for uploading file

*/
public with sharing class Puts3 {
    
    public string awsKey {get;set;}
    public string awsSecret {get;set;}
    public string bucketName {get;set;}
    public string methodName {get;set;}
    public string hostName {get;set;}
    Public String algorithm='AWS4-HMAC-SHA256';
    Public String service='s3';
    Public String regionName {get;set;}
    
    public Puts3(string key, string secret, string bucket, String region, string method, string host)
    {
        awsKey=key;
        awsSecret=secret;
        bucketName=bucket;
        regionName=region;
        methodName=method;
        hostName=host; // value pattern =>     {bucketName}.S3.{regionName}.amazonaws.com
    }
    
    public string ContentType(string fileType)
    {
        switch on fileType.toLowerCase()
        {
            when 'docx'
            {
                return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            }
            when 'csv'
            {
                return 'application/vnd.ms-excel';
            }
            when 'wav'
            {
                return 'audio/wav';
            }
            when 'wmv'
            {
                return 'video/x-ms-wmv';
            }
            when 'mp3'
            {
                return 'audio/mpeg';
            }
            when 'mp4'
            {
                return 'video/mp4';
            }
            when 'png'
            {
                return 'image/png';
                
            }
            when 'pdf'
            {
                return 'application/pdf';
                
            }
            when else {
                return 'image/jpeg';
            }
        }
    }
    
    public string CreateAuthHeader(String contentType,String filename, String formattedDateString,string fileExtension,blob content,String dateStamp )
    {//UNSIGNED-PAYLOAD
        // base64Encode=> convertToHex

        String canonicalRequest = this.methodName+'\n/'+filename.toLowerCase()+ '.'+fileExtension.toLowerCase() + '\n'+' '+'\nhost:' +this.bucketName+'.'+ this.hostName + '\n'+'x-amz-content-sha256:UNSIGNED-PAYLOAD'+'\n'+'x-amz-date:' + formattedDateString +'\n\nhost;x-amz-content-sha256;x-amz-date\n' + EncodingUtil.base64Encode(Crypto.generateDigest('SHA-256',content));
        // String canonicalRequest = this.methodName+'\n/' + filename.toLowerCase()+ '.'+fileExtension.toLowerCase() + '\n\nhost:' +this.bucketName+'.'+ this.hostName + '\nx-amz-content-sha256:UNSIGNED-PAYLOAD\nx-amz-date:' + formattedDateString + '\n\nhost;x-amz-content-sha256;x-amz-date\nUNSIGNED-PAYLOAD';

        String stringToSign = this.algorithm + '\n' + formattedDateString + '\n' + dateStamp + '/' + this.regionName + '/' + this.service + '/aws4_request\n' + EncodingUtil.base64Encode(Crypto.generateDigest('SHA-256', Blob.valueOf(canonicalRequest)));
        
       // String signingKey = EncodingUtil.convertToHex(Crypto.generateMac('HmacSHA256', Blob.valueOf('AWS4' + this.awsSecret), Blob.valueOf(dateStamp)));
        
       // signingKey = EncodingUtil.convertToHex(Crypto.generateMac('HmacSHA256', Blob.valueOf(signingKey), Blob.valueOf(this.regionName)));
        
       // signingKey = EncodingUtil.convertToHex(Crypto.generateMac('HmacSHA256', Blob.valueOf(signingKey), Blob.valueOf(this.service)));
        
       // signingKey = EncodingUtil.convertToHex(Crypto.generateMac('HmacSHA256', Blob.valueOf(signingKey), Blob.valueOf('aws4_request')));
       
        String kSecret = 'AWS4' + this.awsSecret;
        Blob kDate = Crypto.generateMac('HmacSHA256', Blob.valueOf(dateStamp), Blob.valueOf(kSecret));
        Blob kRegion = Crypto.generateMac('HmacSHA256', Blob.valueOf(this.regionName), kDate);
        Blob kService = Crypto.generateMac('HmacSHA256', Blob.valueOf(this.service), kRegion);
        Blob kSigning = Crypto.generateMac('HmacSHA256', Blob.valueOf('aws4_request'), kService);
        Blob signature = Crypto.generateMac('HmacSHA256', Blob.valueOf(stringToSign), kSigning);
                
      //  String signature = EncodingUtil.convertToHex(Crypto.generateMac('HmacSHA256', Blob.valueOf(signingKey), Blob.valueOf(stringToSign)));
        //;x-amz-content-sha256
        //:x-amz-date
        return (this.algorithm + ' Credential=' + this.awsKey + '/' + dateStamp + '/' + this.regionName + '/' + this.service + '/aws4_request, SignedHeaders=host;x-amz-content-sha256;x-amz-date, Signature=' + signature);
                                   }
    
    
    public void UploadDocuments(string recordId)
    {
        if(string.isBlank(this.awsSecret) || string.isBlank(this.awsKey) || string.isBlank(this.bucketName) || string.isBlank(this.hostName))
        {
           system.debug('error at 85');
        }
        List<ContentDocumentLink> links=[SELECT ContentDocumentId,LinkedEntityId FROM ContentDocumentLink where LinkedEntityId=:recordId];
        Set<Id> ids=new Set<Id>();
        for(ContentDocumentLink link:links)
        {
            ids.add(link.ContentDocumentId);
        }
        List<ContentVersion> versions=[SELECT VersionData,Title,ContentDocumentId,FileExtension FROM ContentVersion WHERE ContentDocumentId = :ids AND IsLatest = true];
        
        for(ContentVersion attach:versions)
        {
            try
            {
                system.debug('content version'+attach);
                //File Content
                String attachmentBody = EncodingUtil.base64Encode(attach.VersionData);
                
                //String formattedDateString = Datetime.now().formatGMT('EEE, dd MMM yyyy HH:mm:ss z');
                
                String formattedDateString = Datetime.now().formatGMT('yyyyMMdd\'T\'HHmmss\'Z\'');
                String dateStamp = formattedDateString.substring(0,8);
                    
                String filename = attach.Title;
                string contentType=ContentType(attach.FileExtension);
                system.debug('contentType:'+contentType);
                
                string fileUrl='https://' + this.bucketName + '.' + this.hostName + '/' + filename.toLowerCase()+ '.'+attach.FileExtension.toLowerCase();
                system.debug('fileurl'+fileurl);
                
                 Blob pdfBlob = EncodingUtil.base64Decode(attachmentBody);
                
                HttpRequest req = new HttpRequest();
                req.setMethod(this.methodName);
                req.setEndpoint(fileurl);
               
               // req.setHeader('Host', this.bucketName + '.' + this.hostName);
                req.setHeader('host',this.hostName);
                req.setHeader('Content-Length', String.valueOf(attachmentBody.length()));
                
                req.setHeader('Content-Encoding', 'UTF-8');
               // req.setHeader('Content-Encoding', 'convertToHex');
                req.setHeader('Content-type', contentType);
                req.setHeader('Connection', 'keep-alive');
				req.setHeader('x-amz-date', formattedDateString);
            	req.setBodyAsBlob(pdfBlob); 
				req.setHeader('x-amz-content-sha256','UNSIGNED-PAYLOAD');
				//req.setHeader('x-amz-content-sha256', EncodingUtil.convertToHex(Crypto.generateDigest('SHA-256', pdfBlob)));
                req.setHeader('Authorization',CreateAuthHeader(contentType, filename, formattedDateString,attach.FileExtension,pdfBlob,dateStamp));
                
                //extra headers
               /* req.setHeader('x-amz-acl', 'public-read');
				req.setHeader('x-amz-storage-class', 'STANDARD_IA');
                req.setHeader('X-Amz-Algorithm','AWS4-HMAC-SHA256');*/

                system.debug('request'+req);
                
                Http http = new Http();
                
                HTTPResponse res = http.send(req);
                system.debug('res'+res);
                system.debug('response body'+res.getBody());
                system.debug('response code'+res.getStatusCode());
                if (res.getStatusCode() == 200 || res.getStatusCode()==201) 
                {
                   
                    system.debug('response'+res.getBody());
                }
            }
            catch(Exception ex)
            {
               //throw new BaseException(ex);
               system.debug(ex.getMessage()+' at '+ex.getLineNumber());
            }
        }
    }
    
}