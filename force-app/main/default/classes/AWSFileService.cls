/******************************************************************************
  Date: 23 June 2023
* Descpription: AWS Service for uploading file

*/
public class AWSFileService {
    
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
    
    public void UploadDocuments(string recordId)
    {
        Set<Id> ids=new Set<Id>();
        for(ContentDocumentLink link:[SELECT ContentDocumentId,LinkedEntityId FROM ContentDocumentLink where LinkedEntityId=:recordId])
        {
            ids.add(link.ContentDocumentId);
        }
        if(ids.isEmpty())
        {
            system.debug('error at 63');
        }
        
        List<ContentVersion> versions=[SELECT VersionData,Title,ContentDocumentId,FileExtension FROM ContentVersion WHERE ContentDocumentId = :ids AND IsLatest = true];
        
        //Get Named Credential - get configured s3 url
       // NamedCredential named=[SELECT id,DeveloperName, Endpoint FROM NamedCredential where DeveloperName='AWSSignature'];
        
        for(ContentVersion attach:versions)
        {
            try
            {
            
                String attachmentBody = EncodingUtil.base64Encode(attach.VersionData);
                String formattedDateString = Datetime.now().formatGMT('EEE, dd MMM yyyy HH:mm:ss z');
                string contentType=ContentType(attach.FileExtension); 
                HttpRequest req = new HttpRequest(); 
                req.setMethod('PUT');
                req.setEndpoint('callout:AWSSignature'+'/'+attach.Title.toLowerCase()+ '.'+attach.FileExtension.toLowerCase());   
                req.setHeader('Content-type', contentType);
             // req.setEndpoint('callout:AWSSignature +/+attach.Title.replaceAll([^a-zA-Z0-9\\s+],-).toLowerCase()+ .+attach.FileExtension.toLowerCase());
                Blob pdfBlob = EncodingUtil.base64Decode(attachmentBody);
                req.setBodyAsBlob(pdfBlob);
                
                Http http = new Http();
                HTTPResponse res = http.send(req);
                
                if (res.getStatusCode() == 200 || res.getStatusCode()==201) 
                {
                   system.debug('successfull');
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