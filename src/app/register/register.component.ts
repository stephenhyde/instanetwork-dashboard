import {Component, ViewEncapsulation} from '@angular/core';
import {FormGroup, AbstractControl, FormBuilder, Validators} from '@angular/forms';
import {EmailValidator, EqualPasswordsValidator} from '../theme/validators';
import {AuthenticationService} from '../_services/index';
import {Router} from '@angular/router';

@Component({
  selector: 'register',
  encapsulation: ViewEncapsulation.None,
  styles: [require('./register.scss')],
  template: require('./register.html'),
})
export class RegisterComponent {

  public form: FormGroup;
  public name: AbstractControl;
  public email: AbstractControl;
  public password: AbstractControl;
  public repeatPassword: AbstractControl;
  public passwords: FormGroup;
  public emailExist: boolean = false;
  public usernameExist: boolean = false;
  public submitted: boolean = false;
  public usernamePatternMismatch: boolean = false;
  private allowedUsernameCharacters = new RegExp('[^A-Za-z0-9_-]');

  constructor(private router: Router, private fb: FormBuilder, private authenticationService: AuthenticationService) {

    this.form = fb.group({
      'name': ['', Validators.compose([Validators.required, Validators.minLength(4), Validators.maxLength(20)])],
      'email': ['', Validators.compose([Validators.required, EmailValidator.validate])],
      'passwords': fb.group({
        'password': ['', Validators.compose([Validators.required, Validators.minLength(6)])],
        'repeatPassword': ['', Validators.compose([Validators.required, Validators.minLength(6)])]
      }, {validator: EqualPasswordsValidator.validate('password', 'repeatPassword')})
    });

    this.name = this.form.controls['name'];
    this.email = this.form.controls['email'];
    this.passwords = <FormGroup> this.form.controls['passwords'];
    this.password = this.passwords.controls['password'];
    this.repeatPassword = this.passwords.controls['repeatPassword'];
  }

  ngOnInit() {
    // reset login status
    this.authenticationService.logout();
  }

  public onSubmit(values: Object): void {
    this.emailExist = false;
    this.usernameExist = false;
    this.submitted = true;
    if (this.form.valid && !this.usernamePatternMismatch) {
      this.authenticationService.checkUsername(values['name'])
        .subscribe(result => {
            if (result === false) {
              this.authenticationService.checkEmail(values['email'])
                .subscribe(result => {
                    if (result === false) {
                      this.registerUser(values);
                    } else {
                      this.emailExist = true;
                    }
                  },
                  (err) => {
                    // this.modalAttributeError('Unable to complete request, please try again later')
                  }
                );
            } else {
              this.usernameExist = true;
            }
          },
          (err) => {
            // this.modalAttributeError('Unable to complete request, please try again later')
          }
        );
    }
  }

  registerUser(values: Object) {
    console.log(values);
    this.authenticationService.register(values['name'], values['email'], values['passwords']['password']).subscribe(result => {
        if (result === true) {
          this.router.navigate(['/pages/dashboard']);
        } else {
        }
      },
      (err) => {
      }
    );
  }

  usernameChanged(event: KeyboardEvent) {
    this.usernameExist = false;
    const target = <HTMLInputElement> event.target;
    console.log(target.value);
    this.usernamePatternMismatch = this.allowedUsernameCharacters.test(target.value);
    console.log(this.usernamePatternMismatch);
  }

  emailChanged(event: KeyboardEvent) {
    this.emailExist = false;
  }
}