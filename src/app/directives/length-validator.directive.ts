import {Directive, Input} from '@angular/core';
import {AbstractControl, NG_VALIDATORS, ValidationErrors, Validator, ValidatorFn} from "@angular/forms";

@Directive({
  selector: '[lengthValidator]',
  providers: [{provide: NG_VALIDATORS, useExisting: LengthValidatorDirective, multi: true}]
})
export class LengthValidatorDirective implements Validator {
  @Input('length') length: number = 100;
  validate(control: AbstractControl): ValidationErrors | null {
    let forbidden =  control.value && control.value.length > this.length;
    return forbidden ? { forbiddenName: { value: control.value } } : null;
  }

}
export function forbiddenNameValidator(nameRe: RegExp): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const forbidden = nameRe.test(control.value);
    return forbidden ? { forbiddenName: { value: control.value } } : null;
  };
}
