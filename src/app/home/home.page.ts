import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import * as L from 'leaflet';
import { loadScript } from '@paypal/paypal-js';
import { environment } from '../../environments/environment';

// Los iconos por defecto de Leaflet no se resuelven bien con el bundler; se sirven desde assets/leaflet
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png',
  iconUrl: 'assets/leaflet/marker-icon.png',
  shadowUrl: 'assets/leaflet/marker-shadow.png',
});

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements AfterViewInit, OnDestroy {
  @ViewChild('map') mapRef!: ElementRef<HTMLElement>;

  locating = false;
  locationError = '';
  paypalMessage = '';

  private map?: L.Map;
  private marker?: L.Marker;

  ngAfterViewInit() {
    this.setupPaypalButton();
  }

  ngOnDestroy() {
    this.map?.remove();
  }

  async loadCurrentLocation() {
    this.locationError = '';
    this.locating = true;

    try {
      // requestPermissions() no está implementado en web; el navegador pide el permiso al llamar getCurrentPosition
      if (Capacitor.isNativePlatform()) {
        const permission = await Geolocation.requestPermissions();
        if (permission.location !== 'granted' && permission.coarseLocation !== 'granted') {
          this.locationError = 'Permiso de ubicación denegado.';
          return;
        }
      }

      const position = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
      const coordinate: [number, number] = [position.coords.latitude, position.coords.longitude];

      this.renderMap(coordinate);
    } catch (error) {
      console.error(error);
      this.locationError = 'No se pudo obtener la ubicación actual. Revisa los permisos de ubicación.';
    } finally {
      this.locating = false;
    }
  }

  private renderMap(coordinate: [number, number]) {
    if (!this.map) {
      this.map = L.map(this.mapRef.nativeElement).setView(coordinate, 16);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(this.map);
    } else {
      this.map.setView(coordinate, 16);
    }

    if (this.marker) {
      this.marker.setLatLng(coordinate);
    } else {
      this.marker = L.marker(coordinate).addTo(this.map).bindPopup('Estás aquí').openPopup();
    }
  }

  private async setupPaypalButton() {
    try {
      const paypal = await loadScript({ clientId: environment.paypalClientId, currency: 'USD' });
      if (!paypal?.Buttons) {
        this.paypalMessage = 'No se pudo cargar el botón de PayPal.';
        return;
      }

      await paypal
        .Buttons({
          createOrder: (_data, actions) =>
            actions.order.create({
              intent: 'CAPTURE',
              purchase_units: [{ amount: { value: '10.00', currency_code: 'USD' } }],
            }),
          onApprove: async (_data, actions) => {
            const details = await actions.order?.capture();
            this.paypalMessage = `Pago completado correctamente. Orden: ${details?.id ?? ''}`;
          },
          onError: (err) => {
            console.error(err);
            this.paypalMessage = 'Ocurrió un error al procesar el pago.';
          },
        })
        .render('#paypal-button-container');
    } catch (error) {
      console.error(error);
      this.paypalMessage = 'No se pudo inicializar PayPal.';
    }
  }
}
