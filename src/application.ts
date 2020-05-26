import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {RestExplorerBindings, RestExplorerComponent} from '@loopback/rest-explorer';
import {ServiceMixin} from '@loopback/service-proxy';
import path from 'path';
import {MySequence} from './sequence';
import {BcryptHasher} from './services/hash.password';
import {JWTService} from './services/jwt-service';
import {MyUserService} from './services/user-service';

export {ApplicationConfig};

export class AuthApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {

    super(options);

    // setup binding
    this.setupBinding();

    // Set up the custom sequence
    this.sequence(MySequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };
  }
  setupBinding(): void {
    this.bind('service.hasher').toClass(BcryptHasher);
    this.bind('rounds').to(10);
    this.bind('service.user.service').toClass(MyUserService)
    this.bind('service.jwt.service').toClass(JWTService);
    this.bind('authenticatio.jwt.secret').to('SVDFBT5673YHBY4T4Y6UN77UNRN');
  }
}
