public class MetadataRetriever {
    Private String clientId = '3MVG9wt4IL4O5wvIiww2WidIEJ9i8qjm8R2osVGMO9qpsOe4iqq_h_5IelR3PTkO0YxCUeahrpOnvBYgFaD.H';
    Private String clientSecret = 'CF739E3A4D17B22C0C337B7DF95A052052E2A457476A34278034DB2C63A927F1';
    public void retrieveAllMetadata() {
        try {
            // Create a MetadataPort instance
            MetadataService.MetadataPort metadataPort = new MetadataService.MetadataPort();
            
            // Set up connection parameters
            String username = 'backuprecovery@credex.com';
            String password = 'Credex@1234WdeyRJ1V8H26Yzs6W5GYtmBUJ';
           // String endpoint = 'https://login.salesforce.com/services/Soap/m/58.0'; // Update with the appropriate Salesforce API version
            String endpoint='https://login.salesforce.com/services/oauth2/token?grant_type=password&client_id=3MVG9wt4IL4O5wvIiww2WidIEJ9i8qjm8R2osVGMO9qpsOe4iqq_h_5IelR3PTkO0YxCUeahrpOnvBYgFaD.H&client_secret=CF739E3A4D17B22C0C337B7DF95A052052E2A457476A34278034DB2C63A927F1&username=backuprecovery@credex.com&password=Credex@1234WdeyRJ1V8H26Yzs6W5GYtmBUJ';
            // Set session header
            system.debug('password  '+password);
            MetadataService.SessionHeader_element sessionHeader = new MetadataService.SessionHeader_element();
            sessionHeader.sessionId = /*getAccessToken(endpoint)*/'6Cel800D5i00000EWB8E8885i000000ZvB6XRzC6VRSfeaf4pqt0rcYjGnhvoU2j72VxYGHuXa9PuSIYF9oceFnXIvGDdCNAbiYHXmeRPc7';
            system.debug('sessionId>>>>>>>>>>>>');
            system.debug(getAccessToken(endpoint));
            
            metadataPort.inputHttpHeaders_x = new Map<String, String>();
            metadataPort.inputHttpHeaders_x.put('X-SFDC-Session', sessionHeader.sessionId);
            
            // Call listMetadata() method to retrieve all metadata types
            MetadataService.ListMetadataQuery query = new MetadataService.ListMetadataQuery();
            query.type_x = 'CustomObject'; // Leave it empty to retrieve all types or specify a specific metadata type here
            system.debug('query');
            system.debug(query);
            MetadataService.ListMetadataQuery[] queries = new MetadataService.ListMetadataQuery[] { query };
                system.debug('queries');
            	//system.debug(quer);
            MetadataService.FileProperties[] fileProperties = metadataPort.listMetadata(queries,(Double) 58.0);
            system.debug('fileProperties');
            system.debug(fileProperties);
            // Iterate over the retrieved metadata and process as needed
            for (MetadataService.FileProperties fileProperty : fileProperties) {
                System.debug('Metadata component full name: ' + fileProperty.fullName);
                System.debug('Metadata component type: ' + fileProperty.type_x);
                // Perform additional actions or store the metadata details as required
            }
        } catch (Exception e) {
            // Handle exception
            System.debug('Error: ' + e.getMessage()+' at '+e.getLineNumber());
        }
    }
    
    // Helper method to get the access token
    public String getAccessToken(String endpoint) {
        HttpRequest req = new HttpRequest();
        req.setEndpoint(endpoint);
        req.setMethod('POST');
        req.setHeader('Content-Type', 'application/x-www-form-urlencoded');
        req.setHeader('charset', 'UTF-8');
       // req.setBody('grant_type=password&client_id='+clientId+'&client_secret='+clientSecret+'&username=' + username + '&password=' + password);
        
        Http http = new Http();
        HttpResponse res = http.send(req);
        
        Map<String, Object> response = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
        return (String) response.get('access_token');
    }
}