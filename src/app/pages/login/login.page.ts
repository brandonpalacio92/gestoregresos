import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, ToastController, AlertController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule]
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  showPassword = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private alertController: AlertController
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {}

  async login() {
    if (this.loginForm.valid) {
      const loading = await this.loadingController.create({
        message: 'Iniciando sesión...',
        spinner: 'crescent'
      });
      await loading.present();

      try {
        const { email, password } = this.loginForm.value;
        await this.authService.login(email, password).toPromise();
        
        await loading.dismiss();
        
        const toast = await this.toastController.create({
          message: '¡Bienvenido!',
          duration: 2000,
          color: 'success',
          position: 'top'
        });
        await toast.present();

        // Redirigir al dashboard
        this.router.navigate(['/gestion-mensual']);
      } catch (error: any) {
        await loading.dismiss();
        
        const toast = await this.toastController.create({
          message: error.message || 'Error al iniciar sesión',
          duration: 3000,
          color: 'danger',
          position: 'top'
        });
        await toast.present();
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  async forgotPassword() {
    const alert = await this.alertController.create({
      header: 'Recuperar Contraseña',
      message: 'Por favor, contacta al administrador para recuperar tu contraseña.',
      buttons: ['OK']
    });
    await alert.present();
  }

  private markFormGroupTouched() {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  // Getters para validación en el template
  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }
}
