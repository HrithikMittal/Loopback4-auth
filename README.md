# Authentication in Loopback4

[<img src="https://github.com/strongloop/loopback-next/raw/master/docs/site/imgs/branding/Powered-by-LoopBack-Badge-(blue)-@2x.png" alt="LoopBack" style="zoom: 50%;" />](http://loopback.io/)

The steps given below are to add the Authentication in Loopback4 and if you want to add the authorization also in your project than check out this repo [How to add Authorization](https://github.com/HrithikMittal/loopback4-authorization).

## How to Setup in local System

```powershell
git clone https://github.com/HrithikMittal/loopback4-auth
cd loopback4-auth
npm install

npm run build
npm run migrate
npm start
```



* ### Step1: 

  ```bash
  lb4 model User
  lb4 datasource
  lb4 repository
  ```

* ### Step2: 

  ```bash
  lb4 controller (Empty controller)
  Create a signup and signin routes
  ```

* ### Step3:

  Create a validate service to check the isEmail and password length
  
  ```
  import {HttpErrors} from '@loopback/rest';
	import * as isEmail from 'isemail';
	import {Credentials} from '../repositories/index';

	export function validateCredentials(credentials: Credentials) {
	  if (!isEmail.validate(credentials.email)) {
	    throw new HttpErrors.UnprocessableEntity('invalid Email');
	  }
	  if (credentials.password.length < 8) {
	    throw new HttpErrors.UnprocessableEntity('password length should be greater than 8')
	  }
	}
  ```
  

  Create another service to hash password using bcryptjs

  Create a class ```BcryptHasher``` which implements interface ```PasswordHasher``` 

  In this class again implement two method

  * comparePassword (return: Promise<boolean>)
  * hashPassword (return: Promise<string>)

  

  To use it bind it in the ```application.ts``` 

  ```  typescript
  this.bind('service.hasher').toClass(BcryptHasher);
  ```
  
  
    Now do the SQL Injection in the controller class ``UserController`` constructor

  ```typescript
  @inject('service.hasher')
  public hasher: BcryptHasher,
  ```

  	Use ``hashPassword`` method

	Now just save the user into the db

```
import {inject} from '@loopback/core';
import {compare, genSalt, hash} from 'bcryptjs';
import {PasswordHasherBindings} from '../keys';

export interface PasswordHasher<T = string> {
  hashPassword(password: T): Promise<T>;
  comparePassword(provdedPass: T, storedPass: T): Promise<boolean>
}

export class BcryptHasher implements PasswordHasher<string> {
  async comparePassword(provdedPass: string, storedPass: string): Promise<boolean> {
    const passwordMatches = await compare(provdedPass, storedPass);
    return passwordMatches;
  }

  // @inject('rounds')
  @inject(PasswordHasherBindings.ROUNDS)
  public readonly rounds: number

  // round: number = 10;
  async hashPassword(password: string): Promise<string> {
    const salt = await genSalt(this.rounds);
    return await hash(password, salt);
  }
}
```
  

* ### Step4:

  Create the ``Credentials`` type in repository

  ```typescript
  export type Credentials = {
    email: string;
    password: string;
  }
  ```

  Create the user-service where ``MyUserService`` extends ``UserService`` from ``@loopback/authentictaion``

  In this class again implement two methods

  *  verifyCredentials (return: Promise<User>)
  * convertToUserProfile (return: UserProfile)

  

  Now do the SQL Injection in the class ``MyUserService``  constructor [for verify Credentials]

  ```typescript
  @inject('service.hasher')
  public hasher: BcryptHasher,
  ```

  Use ``` comparePassword``` method from ```BcryptHasher``` class

  

  For [convertToUserProfile] just return

  ```typescript
  return {
        [securityId]: user.id!.toString(),
        name: userName,
        id: user.id,
        email: user.email
      };
  ```

  

  To use it again bind in application.ts

  ```
  this.bind('service.user.service').toClass(MyUserService)
  ```

  Now do the SQL Injection in the controller class ``UserController`` constructor

  ```
  @inject('service.user.service')
  public userService: MyUserService,
  ```

  Now in the ``\login`` route use the methods

  ```typescript
  // make sure user exist,password should be valid
  const user = await this.userService.verifyCredentials(credentials);
  // console.log(user);
  const userProfile = await this.userService.convertToUserProfile(user);
  // console.log(userProfile);
  ```

  

* ### Step5:

    Now create another service which implements ``JWTService`` class 

    In this class implements one method:

  * generateToken (return: Promise<string>)
  * verifyToken (return: Promise<UserProfile>
  
  
  To use it again bind in application.ts
  
  ```typescript
  this.bind('service.jwt.service').toClass(JWTService);
  ```
  
  
  
  Now do the SQL Injection in the controller class ``UserController`` constructor
  
  ```typescript
  @inject('service.jwt.service')
    public jwtService: JWTService,
  ```
  
  Now in the ``\login`` route use the method
  
  ```typescript
  const token = await this.jwtService.generateToken(userProfile);
    return Promise.resolve({token: token})
  ```
  
  

# Congo now you will get the token on Login



* ### Step6: Refracting the code

  Now Create a new file ``Keys.ts``

  ```typescript
  import {TokenService, UserService} from '@loopback/authentication';
  import {BindingKey} from '@loopback/core';
  import {User} from './models';
  import {Credentials} from './repositories/user.repository';
  import {PasswordHasher} from './services/hash.password';
  export namespace TokenServiceConstants {
    export const TOKEN_SECRET_VALUE = '138asda8213';
    export const TOKEN_EXPIRES_IN_VALUE = '7h';
  }
  export namespace TokenServiceBindings {
    export const TOKEN_SECRET = BindingKey.create<string>(
      'authentication.jwt.secret',
    );
    export const TOKEN_EXPIRES_IN = BindingKey.create<string>(
      'authentication.jwt.expiresIn',
    );
    export const TOKEN_SERVICE = BindingKey.create<TokenService>(
      'services.jwt.service',
    );
  }
  export namespace PasswordHasherBindings {
    export const PASSWORD_HASHER = BindingKey.create<PasswordHasher>(
      'services.hasher',
    );
    export const ROUNDS = BindingKey.create<number>('services.hasher.rounds');
  }
  export namespace UserServiceBindings {
    export const USER_SERVICE = BindingKey.create<UserService<Credentials, User>>(
      'services.user.service',
    );
  }
  ```

  and then using these binding put it into the ``application.ts``

  ```typescript
  // this.bind('service.hasher').toClass(BcryptHasher);
  // this.bind('rounds').to(10);
  // this.bind('service.user.service').toClass(MyUserService)
  // this.bind('service.jwt.service').toClass(JWTService);
  // this.bind('authentication.jwt.secret').to('dvchgdvcjsdbhcbdjbvjb');
  // this.bind('authentication.jwt.expiresIn').to('7h');
  
  this.bind(PasswordHasherBindings.PASSWORD_HASHER).toClass(BcryptHasher);
  this.bind(PasswordHasherBindings.ROUNDS).to(10)
  this.bind(UserServiceBindings.USER_SERVICE).toClass(MyUserService);
  this.bind(TokenServiceBindings.TOKEN_SERVICE).toClass(JWTService);
  this.bind(TokenServiceBindings.TOKEN_SECRET).to(
      TokenServiceConstants.TOKEN_SECRET_VALUE)
  this.bind(TokenServiceBindings.TOKEN_EXPIRES_IN).to(
    	TokenServiceConstants.TOKEN_EXPIRES_IN_VALUE);
  ```

  

* ### Step7: How to Protect a route

  Add the decorator ``authenticate('jwt')`` 

  Now to add this ``jwt`` go to the ``sequence.ts`` 

  ```typescript
  import {AuthenticateFn, AuthenticationBindings} from '@loopback/authentication';
  .
  .
  @inject(AuthenticationBindings.AUTH_ACTION)
  protected authenticateRequest: AuthenticateFn
  .
  .
   const route = this.findRoute(request);
  
  // call authentication action
  await this.authenticateRequest(request);
  
  ```

  

  Now create ``jwt-stratgies`` in ``authentication-stratgies``. 

  Here ``JWTStrategy`` class implements ``AuthenticationStrategy`` interface from ``@loopback/authentication``

  and implement one method:

  * authenticate(return: Promise<UserProfile | RedirectRoute | undefined>)

  ```typescript
   async authenticate(request: Request<ParamsDictionary, any, any, ParsedQs>):
      Promise<UserProfile | RedirectRoute | undefined> {
  
      const token: string = this.extractCredentials(request);
      const userProfile = await this.jwtService.verifyToken(token);
      return Promise.resolve(userProfile);
  
    }
  ```

  Now in ``JWT`` service implements verify token

  ```typescript
    async verifyToken(token: string): Promise<UserProfile> {
  
      if (!token) {
        throw new HttpErrors.Unauthorized(
          `Error verifying token:'token' is null`
        )
      };
  
      let userProfile: UserProfile;
      try {
        const decryptedToken = await verifyAsync(token, this.jwtSecret);
        userProfile = Object.assign(
          {[securityId]: '', id: '', name: ''},
          {[securityId]: decryptedToken.id, id: decryptedToken.id, name: decryptedToken.name}
        );
      }
      catch (err) {
        throw new HttpErrors.Unauthorized(`Error verifying token:${err.message}`)
      }
      return userProfile;
    }
  ```

  

* ### Step8: Finally authorized a route

  Now go to the user controller and add the 

  ``security: OPERATION_SECURITY_SPEC,``

  ```typescript
  @authenticate("jwt")
    @get('/users/me', {
      security: OPERATION_SECURITY_SPEC,
      responses: {
        '200': {
          description: 'The current user profile',
          content: {
            'application/json': {
              schema: getJsonSchemaRef(User),
            },
          },
        },
      },
    })
    async me(
      @inject(AuthenticationBindings.CURRENT_USER)
      currentUser: UserProfile,
    ): Promise<UserProfile> {
      return Promise.resolve(currentUser);
    }
  ```

  

  and in the ``application.ts``

  ```typescript
  
  // Add security spec
  this.addSecuritySpec();
  
  this.component(AuthenticationComponent);
  registerAuthenticationStrategy(this, JWTStrategy)
  
  addSecuritySpec(): void {
      this.api({
        openapi: '3.0.0',
        info: {
          title: 'test application',
          version: '1.0.0',
        },
        paths: {},
        components: {securitySchemes: SECURITY_SCHEME_SPEC},
        security: [
          {
            // secure all endpoints with 'jwt'
            jwt: [],
          },
        ],
        servers: [{url: '/'}],
      });
    }
  ```

  By doing this all you can send the token in the API explorer and see the lock sign.



# Finally done 
