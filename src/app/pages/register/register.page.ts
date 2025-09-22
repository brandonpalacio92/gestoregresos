import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, ToastController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule]
})
export class RegisterPage implements OnInit {
  registerForm: FormGroup;
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {
    this.registerForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      telefono: [''],
      fecha_nacimiento: ['']
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {}

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    if (confirmPassword?.errors?.['passwordMismatch']) {
      delete confirmPassword.errors['passwordMismatch'];
      if (Object.keys(confirmPassword.errors).length === 0) {
        confirmPassword.setErrors(null);
      }
    }
    
    return null;
  }

  getMaxDate(): string {
    const today = new Date();
    const year = today.getFullYear() - 13; // Mínimo 13 años
    return `${year}-12-31`;
  }

  async register() {
    if (this.registerForm.valid) {
      const loading = await this.loadingController.create({
        message: 'Creando cuenta...',
        spinner: 'crescent'
      });
      await loading.present();

      try {
        const formData = this.registerForm.value;
        delete formData.confirmPassword; // Remover confirmPassword antes de enviar

        await this.authService.register(formData).toPromise();
        
        await loading.dismiss();
        
        const toast = await this.toastController.create({
          message: '¡Cuenta creada exitosamente!',
          duration: 2000,
          color: 'success',
          position: 'top'
        });
        await toast.present();

        // Redirigir al dashboard
        this.router.navigate(['/gestion-mensual']);
      } catch (error: any) {
        await loading.dismiss();
        
        let errorMessage = 'Error al crear la cuenta';
        if (error.error && error.error.errors) {
          errorMessage = error.error.errors.join(', ');
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        const toast = await this.toastController.create({
          message: errorMessage,
          duration: 4000,
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

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  private markFormGroupTouched() {
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      control?.markAsTouched();
    });
  }

  // Getters para validación en el template
  get email() { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }
  get nombre() { return this.registerForm.get('nombre'); }
  get apellido() { return this.registerForm.get('apellido'); }
  get telefono() { return this.registerForm.get('telefono'); }
  get fecha_nacimiento() { return this.registerForm.get('fecha_nacimiento'); }
}