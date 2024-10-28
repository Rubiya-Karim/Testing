import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MessageService, MessageType } from 'src/app/services/message.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent {
  @ViewChild('myFileInput') myFileInput: any;
  @Input() viewID!:number;
  @Input() property!: any;
  @Input() multiple = false;
  @Input() type = '';
  @Input() fileExtension = ['txt'];
  @Input() fileUploadMessage!: string;
  @Input() sampleFileProp!: any;
  @Output() emitFilesList = new EventEmitter();
  @Output() emitImage = new EventEmitter();
  @Output() emitSampleDownloadAction = new EventEmitter();
  fileList: any = [];
  public message: { type: MessageType; text: string } | null = null;

  baseUrl = environment.url;

  constructor(private messageService: MessageService) {
  }

  ngOnInit(): void {
  }

  getFileExtension(file: any) {
    return file && file.split('.').pop();
  }

  getFileName(file: any) {
    return file && file.split('/').pop();
  }

  getSampleFileURL() {
    return this.baseUrl + this.sampleFileProp?.paramValue.slice(1);
  }

  handleFileInput(inputValue: any): void {
    let data = [...inputValue.target.files];
    for (let f = 0; f < data.length; f++) {
      if (this.fileExtension.length && !this.fileExtension.includes(this.getFileExtension(data[f].name).toLowerCase())) {
        this.handleApiResponse(false, 'Please upload ' + [...this.fileExtension] + ' only');
        this.myFileInput.nativeElement.value = '';
        return;
      }
      if (Math.round((data[f].size / 1024)) > 2048) {
        this.handleApiResponse(false, 'The maximum supported file size 2 MB')
        this.myFileInput.nativeElement.value = '';
        return
      }
    };
    if (!this.multiple) {
      var myReader: FileReader = new FileReader();
      myReader.onloadend = (e: any) => {

        let url = e.target.result;
        var content = url.split(",");
        this.emitImage.emit(content);
      };
      if (data && data[0])
        myReader.readAsDataURL(data[0]);
    }
    this.fileList = data;
    if (data?.length)
      this.emitFilesList.emit({data:data, property:this.property});
    // this.myFileInput.nativeElement.value = '';
  }

  private handleApiResponse(isSuccess: boolean, messageText: string): void {
    const messageType = isSuccess ? MessageType.Success : MessageType.Error;
    this.message = { type: isSuccess ? MessageType.Success : MessageType.Error, text: messageText };
    this.messageService.showMessage(messageText, messageType);
  }

  downloadFile(prop:any) {
    // this.emitSampleDownloadAction.emit(prop);
  }

  onClickIcon(id:any) {
    document.getElementById('Image'+ this.viewID)?.click();
  }


  getLinkWithToken() {
    

    return `${this.baseUrl}trailbillcontrolgroup/download/trailBillUploadSample.txt?Authorization=celcom ${localStorage.getItem('token')}`;
  }
}
