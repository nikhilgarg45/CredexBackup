public with sharing class UploadCSVFileController {
 /* @AuraEnabled
  public static void uploadCSVFile(String fileContent) {
    system.debug('file content>>>>>>>>>>>>>>');
    system.debug(fileContent);
    List<String> csvLines = fileContent.split('\n');
    system.debug('csv lines>>>>>>'+csvLines);
    List<Sobject> recordsToInsert = new List<Sobject>();
      
      
      
	SObjectType objectType = Schema.getGlobalDescribe().get('Account');
    System.debug('objectType: ' + objectType);
    
     Map<String, SObjectField> fieldMap = objectType.getDescribe().fields.getMap();
     system.debug('fieldMap>>>>>>>>>>>>>');
     system.debug(fieldMap);
      
      
      system.debug('size '+csvLines.size());
      system.debug(csvLines[0]);
      //system.debug(csvLines[0]);
    // Skip the header row (if applicable)
    for (Integer i = 1; i < csvLines.size(); i++) {
        
        SObject newRecord = objectType.newSObject();
        
        String[] csvValues = csvLines[i].split(',');
        
        system.debug('csv values'+csvValues);
        
         /*if (fieldMap.containsKey(fieldName) && fieldMap.get(fieldName).getDescribe().isUpdateable()) {
                        SObjectField field = fieldMap.get(fieldName);
                        Schema.DisplayType fieldType = field.getDescribe().getType();
                        System.debug('field: ' + field);
                        System.debug('fieldType: ' + fieldType);
        

      // Map CSV values to custom object fields
      Account obj = new Account();
      obj.Id = csvValues[0];
      obj.Name = csvValues[1];
      // Assign other fields accordingly
      
      recordsToInsert.add(obj);
    }

      system.debug('records to upsert'+recordsToInsert);
    // Insert the records
    upsert recordsToInsert;
  }*/
    
    
    @AuraEnabled
    public static void processCSVFile(String csvContent) {
        SObjectType objectType = Schema.getGlobalDescribe().get('Account');
        Map<String, SObjectField> fieldMap = objectType.getDescribe().fields.getMap();
        /*system.debug('csvContent>>>>>>>>>>>>');
        system.debug(csvContent);*/
        List<String> csvLines = csvContent.split('\n');
        //system.debug('csvLines>>>>>>>>>');
        system.debug(csvLines);
        String[] headers = csvLines[0].split(',');
        system.debug('headers>>>>>>');
        system.debug(headers);

        List<SObject> recordsToInsert = new List<SObject>();

        for (Integer i = 1; i < csvLines.size(); i++) {
            String[] fields = csvLines[i].split(',');

            if (fields.size() == headers.size()) {
            Account newRecord = new Account(); // Replace SObject with the appropriate object type

            for (Integer j = 0; j < headers.size(); j++) {
                String header = headers[j];
                String field = fields[j];
				system.debug('header'+header);
                	system.debug('field'+field);
                if(fieldMap.containsKey(header) && fieldMap.get(header).getDescribe().isUpdateable()){
                newRecord.put(header, field);
                }
            }
            

            recordsToInsert.add(newRecord);
            }
        }

        if (!recordsToInsert.isEmpty()) {
                system.debug('recordsToInsert>>>>>>>>>');
                system.debug(recordsToInsert);
                Database.UpsertResult[] upsertResults = Database.upsert(recordsToInsert,false);
            
            	for (Database.UpsertResult result : upsertResults) {
                if (result.isSuccess()) {
                    // Handle successful upsert
                    system.debug('success');
                } else {
                    for (Database.Error error : result.getErrors()) {
                        system.debug('error'+error.getMessage());
                    }
                }
            }
        }
    }
}