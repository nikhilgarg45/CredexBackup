import { LightningElement,wire,track } from 'lwc';
import getObjectsApiNames from '@salesforce/apex/dataBackup.getObjectsApiNames';
import getRecordsByObject from '@salesforce/apex/dataBackup.getRecordsByObject';
import getObjectsApiNamesBySearch from '@salesforce/apex/dataBackup.getObjectsApiNamesBySearch';
import uploadCSV from '@salesforce/apex/AWSFileService.uploadCSV';
export default class BackupToS3 extends LightningElement {

    @track objectNames = [];
    @track objectApiNames = [];
    
    searchKey;
    csvString='';
    service;
    local=false;
    aws = false;
    value='';
    columns = [{ label: 'Names', fieldName: 'objectName', type: "text" }];

    get options(){
        return [{label:'Local Storage',value:'Local'},
        {label:'AWS S3',value:'S3'}];

    }

    @wire(getObjectsApiNames)
    result({data,error}){
        if (data) {
            this.objectNames = [];
            for (var i = 0; i < data.length; i++){
                    var item={
                    id:i,
                    objectName:data[i]
                    };
                this.objectNames.push(item);
                }
        }
        if(error){
            console.log('error',error);
        }
    }

    handleSearchKey(event){
       // console.log('search key',event.target.value);
        this.searchKey=event.target.value;
        //console.log(this.searchKey.length);
        if(this.searchKey.length>=3){
            getObjectsApiNamesBySearch({textKey:this.searchKey})
                .then(data=>{
                   // console.log('data',data);
                    this.objectNames = [];
                    for (var i = 0; i < data.length; i++){
                            var item={
                            id:i,
                            objectName:data[i]
                            };
                        this.objectNames.push(item);
                        }
                })
                .catch(error=>{
                    console.log('error',error);
                })
        }
    }

   /* SearchAccountHandler(){

        getObjectsApiNamesBySearch({textKey:this.searchKey})
        .then(data=>{
            console.log('data',data);
            this.objectNames = [];
            for (var i = 0; i < data.length; i++){
                    var item={
                    id:i,
                    objectName:data[i]
                    };
                this.objectNames.push(item);
                }
        })
        .catch(error=>{
            console.log('error',error);
        })
    }*/
    
    handleSelect(event){
        //console.log(event.target.value);
        //this.serviceToBackup=event.target.value;
        if (event.target.value =='Local') {
            //console.log(event.target.value);
            this.local = true;
            this.aws = false;
        }
        if (event.target.value =='s3') {
            //console.log(event.target.value);
            this.aws = true;
            this.local = false;
        }
    }

   

    handleRadio(event){
        if (event.target.value =='Local') {
            this.local = true;
            this.aws = false;
        }
        if (event.target.value =='S3') {
            this.aws = true;
            this.local = false;
        }
    }

    handleNext(){
        this.service=true;
    }

  

    
    /*getObjectNames(){
        getObjectsApiNames()
        .then(data=>{          
            console.log(data); 
            console.log(typeof data);
            this.objectNames=[];
            for(var i=0;i<data.length;i++){
                var item={
                    id:i,
                    objectName:data[i]
                };
                this.objectNames.push(item);
            }
            console.log(this.objectNames);
        })
        .catch(error=>{
            console.log(error);
        })
    }*/

    exportData(){
        // fetching Dates selected by user
        /*let dates=this.template.querySelectorAll('lightning-input');
        dates.forEach(function(date){
            if(date.name=='fromDate'){
                this.fromDate=date.value
            }
            else if(date.name=='toDate'){
                this.toDate=date.value;
            }
        },this);
        console.log('from date',this.fromDate);
        console.log('to date',this.toDate);  */
       
        var selectedRows=this.template.querySelector('lightning-datatable').getSelectedRows();
       // console.log('rows'+selectedRows)
        var selectedObjectNames=[];
        selectedObjectNames=JSON.stringify(selectedRows);
        selectedObjectNames = JSON.parse(selectedObjectNames);
        //console.log('obj names' + selectedObjectNames);

        for (var i = 0; i < selectedObjectNames.length; i++){
            this.objectApiNames.push(selectedObjectNames[i].objectName);
        }

        /*for(var i=0;i<this.objectApiNames.length;i++){
            console.log('array',this.objectApiNames[i]);
        }*/
       

        getRecordsByObject({objectNames:this.objectApiNames})
        .then(data=>{
            //console.log('data');
            //console.log(data);
            for(var i=0;i<data.length;i++){
                /*console.log('data at '+i);
                console.log(data[i]);
                console.log('data type');
                console.log(typeof data[i]);*/
                this.downloadCSV(data[i]);
            }
        })
        .catch(error=>{
            console.log(console.log('error',error));
        })
    }

    /* 
        @description : This function is used to convert our data to CSV Format and User can download the file.
    */
    downloadCSV(recordData){
            let rowEnd = '\n';
            let csvString = '';
            // this set elminates the duplicates if have any duplicate keys
            let rowData = new Set();
     
            // getting keys from data
            recordData.forEach(function (record) {
                Object.keys(record).forEach(function (key) {
                    rowData.add(key);
                });
            });
     
            // Array.from() method returns an Array object from any object with a length property or an iterable object.
            rowData = Array.from(rowData);
             
            // splitting using ','
            csvString += rowData.join(',');
            csvString += rowEnd;
     //this.recordsData
            // main for loop to get the data based on key value
            for(let i=0; i < recordData.length; i++){
                let colValue = 0;
     
                // validating keys in data
                for(let key in rowData) {
                    if(rowData.hasOwnProperty(key)) {
                        // Key value 
                        // Ex: Id, Name
                        let rowKey = rowData[key];
                        // add , after every value except the first.
                        if(colValue > 0){
                            csvString += ',';
                        }
                        // If the column is undefined, it as blank in the CSV file.
                        let value = recordData[i][rowKey] === undefined ? '' : recordData[i][rowKey];
                        csvString += '"'+ value +'"';
                        colValue++;
                    }
                }
                csvString += rowEnd;
            }
            console.log('csvString',csvString);
            this.csvString=csvString;
           
            // Creating anchor element to download
            let downloadElement = document.createElement('a');
     
            // This  encodeURI encodes special characters, except: , / ? : @ & = + $ # (Use encodeURIComponent() to encode these characters).
            downloadElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csvString);
            downloadElement.target = '_self';
            
            // CSV File Name
            downloadElement.download = 'Account'+' Data.csv';
            console.log(downloadElement);
            // below statement is required if you are using firefox browser
            document.body.appendChild(downloadElement);
            console.log(document.body);
            // click() Javascript function to download CSV file
            console.log(document);
            downloadElement.click(); 
    }

    uploadS3(){
        console.log('inside upload');
        console.log(typeof this.csvString);
        const blob = new Blob([this.csvString], { type: 'text/csv;charset=utf-8;' });
        console.log('blob'+blob);
        // uploading to s3
        uploadCSV({csvString:this.csvString})
        .then(data=>{
            console.log('successfully send to csv');
        })
        .catch(error=>{
            console.log('error',error);
        })

        console.log('blob object'+blob);
        console.log(typeof blob);
        console.log(navigator.msSaveBlob(blob, 'Account File'));
 
    }
}