import { LightningElement,wire,track } from 'lwc';
import getObjectsApiNames from '@salesforce/apex/dataBackup.getObjectsApiNames';
import getRecordsByObject from '@salesforce/apex/dataBackup.getRecordsByObject';
import getObjectsApiNamesBySearch from '@salesforce/apex/dataBackup.getObjectsApiNamesBySearch';
import uploadCSV from '@salesforce/apex/AWSFileService.uploadCSV';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
export default class BackupToS3 extends LightningElement {

    @track objectNames = [];
    @track objectApiNames = [];
    @track selectedObjectNames=[];
  
    
    isModal=true;
    previous=true;
    currentStep='1';
    searchKey;
    csvString='';
    service=false;
    local=false;
    aws = false;
    value='';
    dataRows;
    objectSelected;
    columns = [{ label: 'Names', fieldName: 'objectName', type: "text" }];

    get options(){
        return [{label:'Local Storage',value:'Local'},
        {label:'AWS S3',value:'S3'}];

    }
    connectedCallback(){
        getObjectsApiNames()
        .then(data=>{
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
            console.log(error);
        })
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

    handleSelection(event){
        console.log(event);
        console.log(event.target.value);
        this.selectedObjectNames=event.detail.selectedRows;
        console.log(event.detail.value);
        console.log('test obj'+this.selectedObjectNames);
        for (let i = 0; i < selectedRows.length; i++) {
            console.log('You selected: ' + selectedRows[i]);
            console.log('You selected: ' + selectedRows[i].objectName);
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
        if(this.aws == true){

        }
    }

     /*handleClick() {
        console.log('in modal');
        const result =  MyModal.open({
            label:'test',
            // `label` is not included here in this example.
            // it is set on lightning-modal-header instead
            size: 'large',
            description: 'Accessible description of modal\'s purpose',
            //content: 'Passed into content api',
        })
        .then((data)=>{
            console.log('success');
        }).catch((error)=>{
            console.log('error');
        })
        // if modal closed with X button, promise returns result = 'undefined'
        // if modal closed with OK button, promise returns result = 'okay'
        console.log(result);
    }*/

    handleNext(){
        this.currentStep='2';
        this.service=true;
        this.previous=false;

        this.dataRows=this.template.querySelector('lightning-datatable').getSelectedRows();
        /*console.log('selectedRows.getSelectedRows()',selectedRows.getSelectedRows());
        console.log('after data');
        console.log('selectedRows ', selectedRows);
        console.log('rows'+selectedRows);*/
       // this.dataRows=selectedRows;
        console.log(this.dataRows);
        console.log(this.dataRows.length);
        if(this.dataRows.length>0){
            this.objectSelected=true;
        }
        else{
            this.objectSelected=false;
        }
       // exportData(selectedRows.getSelectedRows());
    }
    handlePrevious(){
        this.currentStep='1';
        this.previous=true;
        this.service=false;

    }
    
    exportData(){
        console.log('data export');
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
       
       /* var selectedRows=this.template.querySelector('lightning-datatable');
        console.log('after data');
        console.log('selectedRows ', selectedRows);
        console.log('rows'+selectedRows)*/
        var selectedObjectNames=[];
        selectedObjectNames=JSON.stringify(this.dataRows);//rows
        selectedObjectNames = JSON.parse(selectedObjectNames);
      //  console.log('obj names', selectedObjectNames);
        for (var i = 0; i < selectedObjectNames.length; i++){
            this.objectApiNames.push(selectedObjectNames[i].objectName);
        }

      /*
            @description : Implicitly fetching data of objects selected by the user
            */
        getRecordsByObject({objectNames:this.objectApiNames})
        .then(data=>{
            let c = this.objectApiNames[0];  
            for(var i=0;i<this.objectApiNames.length;i++){
                let c = this.objectApiNames[i]
                this.downloadCSV(data[c],c);
            }
        })
        .catch(error=>{
            console.log(console.log('error',error));
        })
    }

    /* 
        @description : This function is used to convert our data to CSV Format and User can download the file.
    */
    downloadCSV(recordData,ApiName){
        // console.log('recordsData>>>>>>>>>',recordData);
        // console.log('ApiName>>>>>>>>>.',ApiName);
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
            downloadElement.download = ApiName+' Data.csv';
            console.log(downloadElement);
            // below statement is required if you are using firefox browser
            document.body.appendChild(downloadElement);
            console.log(document.body);
            // click() Javascript function to download CSV file
            console.log(document);
            downloadElement.click(); 
    }

    uploadS3(){
       /* console.log('inside upload');
        console.log(typeof this.csvString);*/
        const blob = new Blob([this.csvString], { type: 'text/csv;charset=utf-8;' });
        console.log('blob'+blob);
        // uploading to s3
        uploadCSV({csvString:this.csvString})
        .then(data=>{
            console.log('successfully send to csv');
            this.showToast('Your data is successfull Backup to S3','success');
        })
        .catch(error=>{
            this.showToast('Data is not sent to s3','error');
            console.log('error',error);
        })

       /* console.log('blob object'+blob);
        console.log(typeof blob);
        console.log(navigator.msSaveBlob(blob, 'Account File'));*/
 
    }

    showToast(message,variant){
        const event = new ShowToastEvent({
            title:'Sucess',
            message: message,
            variant: variant
        });
        this.dispatchEvent(event);
    }
}