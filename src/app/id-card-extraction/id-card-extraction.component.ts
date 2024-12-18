import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

interface IDCardData {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  place_of_birth: string;
  id_code: string;
}

@Component({
  selector: 'app-id-card-extraction',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    MatIconModule
  ],
  templateUrl: './id-card-extraction.component.html',
  styleUrls: ['./id-card-extraction.component.css']
})
export class IdCardExtractionComponent {
  selectedImage: string | null = null;
  extractedData: IDCardData | null = null;
  errorMessage: string | null = null;
  video: HTMLVideoElement | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.video = document.createElement('video');
  }

  openCamera() {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        if (this.video) {
          this.video.srcObject = stream;
          this.video.play();  // Start the video stream
        }
      })
      .catch(err => {
        console.error("Error accessing camera: ", err);
        this.errorMessage = "Erreur d'accès à la caméra.";
      });
  }

  captureImage() {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (this.video) {
      canvas.width = this.video.videoWidth;
      canvas.height = this.video.videoHeight;
      context?.drawImage(this.video, 0, 0);
      const imageData = canvas.toDataURL('image/png');
      this.selectedImage = imageData;

      // Convert the base64 image to a Blob for uploading
      const blob = this.dataURLtoBlob(imageData);
      this.uploadImage(blob);
    }
  }

  dataURLtoBlob(dataURL: string): Blob {
    const byteString = atob(dataURL.split(',')[1]);
    const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        this.selectedImage = typeof result === 'string' ? result : null;
      };
      reader.readAsDataURL(file);
      this.uploadImage(file);
    }
  }

  uploadImage(file: Blob | File) {
    const formData = new FormData();
    formData.append('file', file, file instanceof File ? file.name : 'captured_image.png');

    this.http.post<IDCardData>('http://127.0.0.1:5000/upload', formData)
      .subscribe({
        next: (response) => {
          this.extractedData = response;
          this.errorMessage = null;
        },
        error: (error) => {
          this.extractedData = null;
          this.errorMessage = error.error?.error || 'Erreur lors de l\'extraction';
        }
      });
  }
}