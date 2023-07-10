import { LightningElement,api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class LightningModal extends LightningElement {
    @api ismodalopen = false;

    openModal() {
        this.ismodalopen = true;
    }

    closeModal() {
        this.ismodalopen = false;
    }

    /*handleSave() {
        // Handle save logic
        this.closeModal();
        this.showToast('Success', 'Record saved successfully!', 'success');
    }*/

    showToast(title, message, variant) {
        const toastEvent = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(toastEvent);
    }
}