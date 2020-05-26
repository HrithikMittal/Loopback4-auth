# Auth

[<img src="https://github.com/strongloop/loopback-next/raw/master/docs/site/imgs/branding/Powered-by-LoopBack-Badge-(blue)-@2x.png" alt="LoopBack" style="zoom: 50%;" />](http://loopback.io/)



* Step1: 

  ```typescript
  lb4 model User
  ```

  

* Step2:

  ```
  lb4 datasource
  ```

* Step3: 

  ```
  lb4 controller (Empty controller)
  Create a signup and signin routes
  ```

* Step4:

  Create a validate service to check the isEmail and password length

  Create another service to hash password using bcryptjs
  create a class ```BcryptHasher``` which implements interface ```PasswordHasher``` 

  To use it bind it in the ```application.ts``` 

  ```  this.bind('service.hasher').toClass(BcryptHasher);```
  Now do the SQL Injection in the controller class ``UserController`` constructor

  ```
  @inject('service.hasher')
  public hasher: BcryptHasher,
  ```

  Now just save the user into the db

  

  