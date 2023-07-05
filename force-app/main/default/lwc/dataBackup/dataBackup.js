import { LightningElement,track } from 'lwc';
import getObjectsApiNames from '@salesforce/apex/dataBackup.getObjectsApiNames';
import getRecords from '@salesforce/apex/dataBackup.getRecords';
import getRecordsByObject from '@salesforce/apex/dataBackup.getRecordsByObject';
//import {ShowToastEvent} from '@lightning/platformShowToastEvent';



export default class DataBackup extends LightningElement {
    dataSection=false;
    objectApiName;
    columnHeader = ['ID', 'Name'];
    recordsData;
    fromDate;
    toDate;
    @track objectNames=[];

    @track setobjectNames=[];

    @track objectApiNames=[];

    columns=[{label:'Names',fieldName:'objectName',type:"text"}];
    

    /* 
        @description : This function is used to fetch Api Names of all objects in SF whether it's Setup or Non-Setup
    */
    getObjectNames(){
        this.dataSection=true;
        getObjectsApiNames()
        .then(data=>{           
            this.objectNames=[];
            for(var i=0;i<data.length;i++){
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


    

    /* 
        @description : This function is used to fetch records Data based on object name and dates selected
    */
    exportData(){
        // fetching Dates selected by user
        let dates=this.template.querySelectorAll('lightning-input');
        dates.forEach(function(date){
            if(date.name=='fromDate'){
                this.fromDate=date.value
            }
            else if(date.name=='toDate'){
                this.toDate=date.value;
            }
        },this);
        console.log('from date',this.fromDate);
        console.log('to date',this.toDate);  
       
        var selectedRows = this.template.querySelector('lightning-datatable').getSelectedRows();
        console.log('rows'+selectedRows);


        var selectedObjectNames=[];
        selectedObjectNames=JSON.stringify(selectedRows);
        selectedObjectNames = JSON.parse(selectedObjectNames);
        console.log('obj names' + selectedObjectNames);

        for(var i=0;i<selectedObjectNames.length;i++){
            this.objectApiNames.push(selectedObjectNames[i].objectName);
        }

        for(var i=0;i<this.setobjectNames.length;i++){
            console.log('array',this.objectApiNames[i]);
        }
       
        // last work done

        //calling to the method of Apex class
        
      /* getRecords({objectName:this.objectApiName,fromDate:this.fromDate,toDate:this.toDate})
        .then(data=>{
            console.log('data',data);

            
            for(var i=0;i<data.length;i++){
                console.log('data at'+i+' '+data[i]);
            }
            this.recordsData=data;
            console.log('records data');
            console.log(this.recordsData);
        })
        .catch(error=>{
            console.log('error',error);
        })*/

        getRecordsByObject({objectNames:this.objectApiNames})
        .then(data=>{
            console.log('data');
            console.log(data);
            for(var i=0;i<data.length;i++){
                console.log('data at '+i);
                console.log(data[i]);
                console.log('data type');
                console.log(typeof data[i]);
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

   /* downloadCSV(){
            // Prepare a html table
        let doc = '<table>';
        // Add styles for the table
        doc += '<style>';
        doc += 'table, th, td {';
        doc += '    border: 1px solid black;';
        doc += '    border-collapse: collapse;';
        doc += '}';          
        doc += '</style>';
        // Add all the Table Headers
        doc += '<tr>';
        this.columnHeader.forEach(element => {            
            doc += '<th>'+ element +'</th>'           
        });
        doc += '</tr>';
        // Add the data rows
        this.recordsData.forEach(record => {
            doc += '<tr>';
            doc += '<th>'+record.Id+'</th>'; 
            /*doc += '<th>'+record.FirstName+'</th>'; 
            doc += '<th>'+record.LastName+'</th>';
            doc += '<th>'+record.Name+'</th>'; 
            doc += '</tr>';
        });
        doc += '</table>';
        var element = 'data:application/vnd.ms-excel,' + encodeURIComponent(doc);
        let downloadElement = document.createElement('a');
        downloadElement.href = element;
        downloadElement.target = '_self';
        // use .csv as extension on below line if you want to export data as csv
        downloadElement.download = 'Contact Data.xls';
        document.body.appendChild(downloadElement);
        downloadElement.click();
    
        }*/
    
}