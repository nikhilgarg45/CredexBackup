import { LightningElement,track } from 'lwc';
//import uploadCSVFile from '@salesforce/apex/UploadCSVFileController.uploadCSVFile';
import getObjectsApiNames from '@salesforce/apex/dataBackup.getObjectsApiNames';
import getObjectsApiNamesBySearch from '@salesforce/apex/dataBackup.getObjectsApiNamesBySearch';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import processCSVFile from '@salesforce/apex/UploadCSVFileController.processCSVFile';
export default class DataRecovery extends LightningElement {

    csvFile;
    fileName='No files selected';
    searchKey
    @track objectNames = [];
    columns = [{ label: 'Names', fieldName: 'objectName', type: "text" }];
    totalRecords;
    insertedRecords;
    updatedRecords;
    recordsNotProcessed;
    showRecordDetails=false;
    isLoading=false;
    result=false;

    vfRoot = "https://credextechnology13-dev-ed--c.develop.vf.force.com/";


    connectedCallback(){
      console.log('inside connected callback');
     /* getObjectsApiNames()
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
      })*/

      window.addEventListener("message", (message) => {
        console.log('inside window.origin>>>>>>>.');
        console.log('origin',message.origin);
        /* if (message.origin !== this.vfRoot) {
           //Not the expected origin
           return;
         }*/
         console.log('message>>>>>>');
         console.log(message);
         //handle the message
         if (message.data.name === "SampleVFToLWCMessage") {
           console.log('message from vf >>>>>>>>.');
           console.log(message.data.payload);
           this.messageFromVF = message.data.payload;
         }
         console.log('messageFromVF>>>>>>>>>>>>');
         console.log(this.messageFromVF[0]);
         //console.log(this.messageFromVF[0].filename);
         //console.log(typeof this.messageFromVF[0].filename);
       });
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


    handleFileChange(event) {
        this.csvFile = event.target.files[0];
        this.fileName= event.target.files[0].name;
        this.showToast('Files Uploaded Sucessfully',this.fileName+'  Uploaded Successully','success');
       console.log('name'+this.fileName);
       console.log(this.csvFile);

        var vfWindow = this.template.querySelector("iframe").contentWindow;
        console.log('vfWindow>>>');
        console.log(vfWindow);
        vfWindow.postMessage(this.csvFile,this.vfRoot);
       

    }
     handleUpload() {
      /*var vfWindow = this.template.querySelector("iframe").contentWindow;
        console.log('vfWindow>>>');
        console.log(vfWindow);
        vfWindow.postMessage(this.csvFile,this.vfRoot);*/

      if(this.csvFile==null){
        this.showToast('Required','Please upload file for Recovery','error');
      }
      else{
        console.log('mssage>>>>>>',this.messageFromVF);
        console.log(typeof this.messageFromVF);
        this.isLoading=true;
        console.log('loading '+this.isLoading);
        this.showRecordDetails=true;
          if (this.csvFile) {
            console.log('vf message>>>>>>>>');
            console.log('type>>>>>>>>>>>>>');
            console.log(typeof this.messageFromVF);
            processCSVFile({ csvContent:JSON.stringify(this.messageFromVF)})
                .then((result) => {
                  // Handle success
                  if(result){
                    this.isLoading=false;
                  }
                  this.result=true;
                  this.totalRecords = result['totalRecords'];
                  this.updatedRecords = result['updatedRecords'];
                  this.insertedRecords = result['createdRecords'];
                  this.recordsNotProcessed = result['recordsNotProcessed'];
                  console.log(result);
                 // refreshApex()
                })
                .catch((error) => {
                  // Handle error
                });

           /* const reader = new FileReader();
            reader.onload = (event) => {
              const fileContent = event.target.result;
              // Pass file content to Apex method
             // console.log('file content>>>>>>>>>>'+fileContent);

              
              
            };
            reader.readAsText(this.csvFile);*/
          }
        }
      }

      showToast(title, message, variant) {
        const toastEvent = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(toastEvent);
    }
}