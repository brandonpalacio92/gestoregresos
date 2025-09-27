# 🎨 ESTILOS ESTANDARIZADOS - GestorEgresos

## 📋 Descripción

Este documento describe los estilos estandarizados implementados en la aplicación GestorEgresos para mantener consistencia visual y de experiencia de usuario en todos los módulos.

## 🎯 Objetivos

- **Consistencia Visual**: Mantener un diseño uniforme en toda la aplicación
- **Experiencia de Usuario**: Proporcionar una interfaz intuitiva y familiar
- **Mantenibilidad**: Facilitar la actualización y modificación de estilos
- **Accesibilidad**: Asegurar que todos los componentes sean accesibles
- **Responsive Design**: Adaptar la interfaz a diferentes tamaños de pantalla

## 🎨 Sistema de Temas

### Variables CSS Globales

```scss
:root {
  /* Tema claro por defecto */
  --theme-background: #ffffff;
  --theme-surface: #f8f9fa;
  --theme-text: #000000;
  --theme-text-secondary: #6c757d;
  --theme-border: #dee2e6;
  --theme-shadow: rgba(0, 0, 0, 0.1);
  --theme-hover: #f8f9fa;
  --theme-focus: rgba(var(--ion-color-primary-rgb), 0.2);
}

body.dark {
  /* Tema oscuro */
  --theme-background: #0d0d0d;
  --theme-surface: #1a1a1a;
  --theme-text: #ffffff;
  --theme-text-secondary: #cccccc;
  --theme-border: #333333;
  --theme-shadow: rgba(0, 0, 0, 0.3);
  --theme-hover: #2a2a2a;
  --theme-focus: rgba(var(--ion-color-primary-rgb), 0.3);
}
```

## 🧩 Componentes Estandarizados

### 1. Cards

```html
<ion-card class="card-estandarizada">
  <ion-card-header class="card-header">
    <ion-card-title class="card-title">Título</ion-card-title>
    <ion-card-subtitle class="card-subtitle">Subtítulo</ion-card-subtitle>
  </ion-card-header>
  <ion-card-content class="card-content">
    Contenido de la card
  </ion-card-content>
</ion-card>
```

### 2. Botones

```html
<!-- Botón primario -->
<ion-button class="boton-estandarizado">Botón Primario</ion-button>

<!-- Botón outline -->
<ion-button class="boton-estandarizado" fill="outline">Botón Outline</ion-button>
```

### 3. Inputs

```html
<ion-input class="input-estandarizado" placeholder="Ingrese texto"></ion-input>
<ion-textarea class="textarea-estandarizado" placeholder="Ingrese texto largo"></ion-textarea>
```

### 4. Items

```html
<ion-item class="item-estandarizado">
  <ion-label class="label-estandarizado">Etiqueta</ion-label>
  <ion-input class="input-estandarizado"></ion-input>
</ion-item>
```

### 5. Badges

```html
<ion-badge class="badge-estandarizado">Normal</ion-badge>
<ion-badge class="badge-estandarizado success">Éxito</ion-badge>
<ion-badge class="badge-estandarizado warning">Advertencia</ion-badge>
<ion-badge class="badge-estandarizado danger">Error</ion-badge>
```

### 6. Chips

```html
<ion-chip class="chip-estandarizado">
  <ion-label>Etiqueta</ion-label>
</ion-chip>
```

### 7. Progress Bars

```html
<ion-progress-bar class="progress-estandarizado" value="0.5"></ion-progress-bar>
```

### 8. Toggles

```html
<ion-toggle class="toggle-estandarizado"></ion-toggle>
```

### 9. Checkboxes

```html
<ion-checkbox class="checkbox-estandarizado"></ion-checkbox>
```

### 10. Radio Buttons

```html
<ion-radio class="radio-estandarizado"></ion-radio>
```

### 11. Range

```html
<ion-range class="range-estandarizado" min="0" max="100" value="50"></ion-range>
```

### 12. Selects

```html
<ion-select class="select-estandarizado">
  <ion-select-option value="opcion1">Opción 1</ion-select-option>
  <ion-select-option value="opcion2">Opción 2</ion-select-option>
</ion-select>
```

## 📐 Layouts Estandarizados

### 1. Grid

```html
<!-- Grid de 2 columnas -->
<div class="grid-estandarizado columnas-2">
  <div>Elemento 1</div>
  <div>Elemento 2</div>
</div>

<!-- Grid automático -->
<div class="grid-estandarizado auto-fit">
  <div>Elemento 1</div>
  <div>Elemento 2</div>
  <div>Elemento 3</div>
</div>
```

### 2. Flex

```html
<!-- Flex horizontal -->
<div class="flex-estandarizado">
  <div>Elemento 1</div>
  <div>Elemento 2</div>
</div>

<!-- Flex vertical -->
<div class="flex-estandarizado vertical">
  <div>Elemento 1</div>
  <div>Elemento 2</div>
</div>

<!-- Flex centrado -->
<div class="flex-estandarizado centrado">
  <div>Elemento centrado</div>
</div>

<!-- Flex con espacio entre elementos -->
<div class="flex-estandarizado espaciado">
  <div>Izquierda</div>
  <div>Derecha</div>
</div>
```

### 3. Contenedor

```html
<div class="contenedor-estandarizado">
  <h1 class="titulo-estandarizado">Título</h1>
  <p class="texto-estandarizado">Contenido</p>
</div>
```

## 🎭 Estados Estandarizados

### 1. Estados de Éxito

```html
<div class="estado-exito">
  <ion-icon name="checkmark-circle"></ion-icon>
  <span>Operación exitosa</span>
</div>
```

### 2. Estados de Advertencia

```html
<div class="estado-advertencia">
  <ion-icon name="warning"></ion-icon>
  <span>Advertencia</span>
</div>
```

### 3. Estados de Error

```html
<div class="estado-error">
  <ion-icon name="close-circle"></ion-icon>
  <span>Error</span>
</div>
```

### 4. Estados de Información

```html
<div class="estado-info">
  <ion-icon name="information-circle"></ion-icon>
  <span>Información</span>
</div>
```

### 5. Estados Neutrales

```html
<div class="estado-neutral">
  <ion-icon name="help-circle"></ion-icon>
  <span>Neutral</span>
</div>
```

## 🎬 Animaciones Estandarizadas

### 1. Animación de Entrada

```html
<div class="animacion-entrada">
  <p>Contenido con animación de entrada</p>
</div>
```

### 2. Animación de Hover

```html
<div class="animacion-hover">
  <p>Contenido con animación de hover</p>
</div>
```

### 3. Animación de Focus

```html
<input class="animacion-focus" type="text" placeholder="Input con animación de focus">
```

## 📱 Responsive Design

Los estilos estandarizados incluyen breakpoints automáticos:

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Ejemplo de uso responsive:

```html
<div class="grid-estandarizado columnas-3">
  <!-- En desktop: 3 columnas -->
  <!-- En mobile: 1 columna -->
</div>
```

## 🔧 Implementación

### 1. Importar estilos globales

```scss
// En global.scss
@import './app/estilos-estandarizados.scss';
```

### 2. Usar en componentes

```html
<!-- En cualquier página -->
<ion-card class="card-estandarizada">
  <ion-card-header class="card-header">
    <ion-card-title class="card-title">Mi Título</ion-card-title>
  </ion-card-header>
  <ion-card-content class="card-content">
    <p class="texto-estandarizado">Mi contenido</p>
  </ion-card-content>
</ion-card>
```

### 3. Personalizar estilos

```scss
// En el archivo SCSS del componente
.mi-componente {
  .card-estandarizada {
    // Personalizaciones específicas
    border-radius: 16px;
  }
}
```

## 📋 Checklist de Implementación

- [ ] Importar `estilos-estandarizados.scss` en `global.scss`
- [ ] Usar clases estandarizadas en todos los componentes
- [ ] Mantener consistencia visual entre módulos
- [ ] Probar en modo claro y oscuro
- [ ] Verificar responsive design
- [ ] Validar accesibilidad
- [ ] Documentar personalizaciones específicas

## 🚀 Beneficios

1. **Consistencia**: Todos los módulos tienen el mismo aspecto
2. **Mantenibilidad**: Cambios centralizados en un solo lugar
3. **Productividad**: Desarrollo más rápido con componentes predefinidos
4. **Accesibilidad**: Estilos que cumplen estándares de accesibilidad
5. **Responsive**: Adaptación automática a diferentes pantallas
6. **Temas**: Soporte completo para modo claro y oscuro

## 📚 Recursos Adicionales

- [Ionic Framework Documentation](https://ionicframework.com/docs)
- [CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [Responsive Design Principles](https://web.dev/responsive-web-design-basics/)
- [Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
