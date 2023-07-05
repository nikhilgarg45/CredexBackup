import { LightningElement } from 'lwc';
//import uploadCSVFile from '@salesforce/apex/UploadCSVFileController.uploadCSVFile';
import processCSVFile from '@salesforce/apex/UploadCSVFileController.processCSVFile';
export default class DataRecovery extends LightningElement {
    csvFile;
    handleFileChange(event) {
        this.csvFile = event.target.files[0];
        console.log('csv file'+this.csvFile);
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
}