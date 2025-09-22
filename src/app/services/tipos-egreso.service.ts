import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TipoEgreso, TipoEgresoConCategorias } from '../models/tipo-egreso.model';
import { Categoria } from '../models/categoria.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TiposEgresoService {

  private apiUrl = 'http://localhost:3000/api/egresos/tipos-egreso';

  constructor(private http: HttpClient) { }

  // Obtener todos los tipos de egresos
  getTiposEgreso(): Observable<TipoEgreso[]> {
    return this.http.get<TipoEgreso[]>(this.apiUrl);
  }

  // Obtener tipo por ID
  getTipoEgresoPorId(id: string): Observable<TipoEgreso | null> {
    return this.http.get<TipoEgreso | null>(`${this.apiUrl}/${id}`);
  }

  // Obtener tipos con sus categorías
  getTiposConCategorias(): Observable<TipoEgresoConCategorias[]> {
    return this.http.get<TipoEgresoConCategorias[]>(`${this.apiUrl}/con-categorias`);
  }
  
  // Obtener categorías por tipo de egreso usando la ruta con-categorias
  getCategoriasPorTipo(tipoId: string): Observable<Categoria[]> {
    return this.http.get<TipoEgresoConCategorias[]>(`${this.apiUrl}/con-categorias`)
      .pipe(
        map((tipos: TipoEgresoConCategorias[]) => {
          const tipo = tipos.find(t => t.id === +tipoId); // +tipoId lo convierte a número
          return tipo ? tipo.categorias : [];
        })
      );
  }
  

}
