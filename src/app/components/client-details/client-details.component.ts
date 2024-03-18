import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {ClientInfoService} from "../../services/client-info.service";
import {ClientDetailsContract} from "../../contracts/clientDetailContract";
import {
  AbstractControl,
  AsyncValidatorFn,
  FormControl, FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators
} from "@angular/forms";
import {delay, Observable, of} from "rxjs";

@Component({
  selector: 'app-client-details',
  templateUrl: './client-details.component.html',
  styleUrl: './client-details.component.scss'
})
export class ClientDetailsComponent implements OnInit
{
    private clientid: string | null = null;
    client: ClientDetailsContract | null = null;
    bill:number = 1; // validator base (HTML5)
    testFormControl: FormControl = new FormControl("Jon",{ validators:[Validators.required, syncValidator(3)]},[asyncValidator2(22)]);
    fullNameControls: FormGroup = new FormGroup<any>({
      testFirstNameFormControl: new FormControl(),
      testLastFormControl:new FormControl()
    });
    constructor(private route: ActivatedRoute, private clientDetailsService: ClientInfoService) {
    }
    ngOnInit(): void {
      this.clientid = this.route.snapshot.paramMap.get('id');

      if (this.clientid){
        this.clientDetailsService.getDetails(this.clientid).subscribe((details)=> {
          this.client = details;
        })
      }

      this.testFormControl.valueChanges.pipe(delay(10)).subscribe((value)=> console.log("value:" + value));
      this.testFormControl.statusChanges.subscribe((value)=>{
        console.log("status:" + value);
        console.log(this.testFormControl?.errors);
      });
    }
}

function syncValidator(data: number):ValidatorFn{
  return function(formControl: AbstractControl):ValidationErrors | null {
    if (formControl.value.lang < data){
      return {'syncValidator': false}
    }
    return null;
  }
}

function asyncValidator2(data: number):AsyncValidatorFn{
  return function(control: AbstractControl): Observable<ValidationErrors | null>{
    if (control.value.lang < data){
      return of({'asyncValidator2': false})
    }
    return of(null);
  }
}
function asyncValidator(formControl: AbstractControl): Observable<ValidationErrors | null>{
  if (formControl.value.lang < 3){
    return of({'asyncValidator': false});
  }
  return of(null);
}
