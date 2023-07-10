public with sharing class dataBackup {

    //public static List<EntityDefnition> objectsApiNames;
   private static List<String> objectsNames=new List<String>();
    
    /**
       *@description:  This method is use to fetch all the Api names of objects in salesforce For both Setup and NonSetup
		
		**/
     @auraEnabled(cacheable=true)
    public static List<String>  getObjectsApiNamesBySearch(String textKey){
        List<String> objects=new List<String>();
        system.debug('data');
        textKey='%' + textKey +'%';
        List<EntityDefinition> objectsApiNames=[SELECT ID,QualifiedApiName FROM EntityDefinition WHERE QualifiedApiName Like:textKey];
        //system.debug(objectsApiNames);
        for(EntityDefinition entity:objectsApiNames){
            objects.add(entity.QualifiedApiName);
        }
        return objects;
    }
    
    @auraEnabled(cacheable=true)
    public static List<String>  getObjectsApiNames(){
        system.debug('data');
        List<EntityDefinition> objectsApiNames=[SELECT ID,QualifiedApiName FROM EntityDefinition ORDER BY QualifiedApiName];
        //system.debug(objectsApiNames);
        for(EntityDefinition entity:objectsApiNames){
            objectsNames.add(entity.QualifiedApiName);
        }
        return objectsNames;
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
       /* FOR(schema.SObjectType obj:Schema.getGlobalDescribe().values())
        {
            Schema.DescribeSObjectResult objResult = obj.getDescribe();
            /*system.debug( 'Sobject: ' + objResult );
            system.debug( 'Sobject API Name: ' + objResult.getName() );
            system.debug( 'Sobject Label Name: ' + objResult.getLabel() );
            objectsNames.add(objResult.getName());
        }
        List<String> objectList=new List<String>(objectsNames);
        objectList.sort();
        for(string s:objectList){
            system.debug(s);
        }*/
        
        
    }
    
    @auraEnabled(cacheable=true)
    public static List<Account> getRecords(String objectName,String fromDate, String toDate){
        system.debug('fromDate'+fromDate);
        system.debug('toDate'+toDate);
        system.debug('object'+objectName);
        
       Map<String, Schema.SObjectField> fieldMap = account.sObjectType.getDescribe().fields.getMap();        
        // Get all of the fields on the object
        Set<String> setFieldNames = fieldMap.keySet();
        list<String> lstFieldNames = new List<String>(setFieldNames);
        //system.debug(lstFieldNames);
        // Dynamic Query String.
        List<Account> lstAccounts = Database.query('SELECT ' + String.join(lstFieldNames, ',') + ' FROM '+objectName);
       // system.debug('SELECT ' + String.join(lstFieldNames, ',') + ' FROM '+objectName);
       //List<Account> lstAccounts = Database.query('SELECT ' + String.join(lstFieldNames, ',') + ' FROM '+objectName+' WHERE CreatedDate>=:toDate AND CreatedDate<=:fromDate);
       system.debug(lstAccounts);
        return lstAccounts;
    }
    
    @auraEnabled(cacheable=true)
    Public static Map<String,list<Sobject>> getRecordsByObject(List<String> objectNames){
        Map<String,list<Sobject>> ObjectsData=new Map<String,list<Sobject>>();
        system.debug('objectNames'+objectNames);
            List<list<Sobject>> recordsToBackup=new List<list<Sobject>>();
            Map<String, Schema.SObjectType> schemaMap = Schema.getGlobalDescribe();
            for(string objectName:objectNames){
                Map<String, Schema.SObjectField> fieldMap = schemaMap.get(objectName).getDescribe().fields.getMap();
                Set<String> fields=fieldMap.keySet();
                List<String> FieldNames = new List<String>(fields);
                List<Sobject> objectRecords=Database.query('SELECT ' + String.join(FieldNames, ',') + ' FROM '+objectName);
               // system.debug(objectRecords);
                recordsToBackup.add(objectRecords);
                ObjectsData.put(objectName,objectRecords);
            }
        
        system.debug('DataMap'+ObjectsData);
                
               // return recordsToBackup;
               return ObjectsData;
       
    }
}