import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import Tesseract from 'tesseract.js';

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
          this.video.play();  // Lancer le flux vidéo
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
      this.extractTextFromImage(imageData);
    }
  }

  extractTextFromImage(image: string) {
    Tesseract.recognize(
      image,
      'eng',
      {
        logger: info => console.log(info)
      }
    ).then(({ data: { text } }) => {
      console.log(text);
      this.extractedData = this.parseExtractedData(text);
    }).catch(err => {
      this.errorMessage = 'Erreur lors de l\'extraction des données : ' + err.message;
    });
  }

  parseExtractedData(text: string): IDCardData {
    const lines = text.split('\n');
    return {
      first_name: lines[0] || '',
      last_name: lines[1] || '',
      date_of_birth: lines[2] || '',
      place_of_birth: lines[3] || '',
      id_code: lines[4] || ''
    };
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

  uploadImage(file: File) {
    const formData = new FormData();
    formData.append('file', file, file.name);

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
