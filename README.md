# Auth

[<img src="https://github.com/strongloop/loopback-next/raw/master/docs/site/imgs/branding/Powered-by-LoopBack-Badge-(blue)-@2x.png" alt="LoopBack" style="zoom: 50%;" />](http://loopback.io/)



* Step1: 

  ```bash
  lb4 model User
  lb4 datasource
  lb4 repository
  ```

* Step2: 

  ```bash
  lb4 controller (Empty controller)
  Create a signup and signin routes
  ```

* Step3:

  Create a validate service to check the isEmail and password length

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

  

* Step4:

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

  

* Step5:

    Now create another service which implements ``JWTService`` class 

    In this class implements one method:

  * generateToken (return: Promise<string>)

 

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

  