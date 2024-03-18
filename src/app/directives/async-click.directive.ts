import { Directive, HostBinding, HostListener, Input } from '@angular/core';
import { Observable, from, take } from 'rxjs';

@Directive({
  selector: '[appClickWait]'
})
export class AsyncClickDirective {
  @HostBinding('disabled')
  public waiting = false;
   
  @Input()
  appClickWait: () => Observable<any> | Promise<any> = async() => void 0;
   
  @HostListener('click')
  clickEvent() {
     this.waiting = true;
   
     from(this.appClickWait()).pipe(take(1)).subscribe({
        next: () => this.waiting = false,
        complete: () => this.waiting = false,
        error: (e) => {
           console.error(e);
           this.waiting = false;
        }
     });
  }
}
