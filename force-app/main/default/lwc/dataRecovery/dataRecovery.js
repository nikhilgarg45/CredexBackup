import { LightningElement,track } from 'lwc';
//import uploadCSVFile from '@salesforce/apex/UploadCSVFileController.uploadCSVFile';
import getObjectsApiNames from '@salesforce/apex/dataBackup.getObjectsApiNames';
import getObjectsApiNamesBySearch from '@salesforce/apex/dataBackup.getObjectsApiNamesBySearch';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import processCSVFile from '@salesforce/apex/UploadCSVFileController.processCSVFile';
export default class DataRecovery extends LightningElement {
    csvFile;
    fileName;
    searchKey
    @track objectNames = [];
    columns = [{ label: 'Names', fieldName: 'objectName', type: "text" }];

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


    handleFileChange(event) {
        this.csvFile = event.target.files[0];
        this.fileName= event.target.files[0].name;
        //this.showToast('Files Uploaded Sucessfully',this.fileName+'  Uploaded Successully for Recovery',success);
       console.log('name'+this.fileName)
    }
    handleUpload() {
        if (this.csvFile) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const fileContent = event.target.result;
            // Pass file content to Apex method
            console.log('file content>>>>>>>>>>'+fileContent);
            processCSVFile({ csvContent:fileContent })
              .then((result) => {
                // Handle success
              })
              .catch((error) => {
                // Handle error
              });
          };
          reader.readAsText(this.csvFile);
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