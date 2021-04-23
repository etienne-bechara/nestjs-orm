import { Injectable, LoggerService } from '@bechara/nestjs-core';

import { CompanyService } from '../company/company.service';
import { ContactType } from '../contact/contact.enum';
import { ContactService } from '../contact/contact.service';
import { PersonService } from '../person/person.service';

@Injectable()
export class StartupService {

  public constructor(
    private readonly contactService: ContactService,
    private readonly companyService: CompanyService,
    private readonly loggerService: LoggerService,
    private readonly personService: PersonService,
  ) {
    void this.createBaseEntities();
  }

  /**
   * Create several entities with relationships for
   * demonstration purposes.
   */
  private async createBaseEntities(): Promise<void> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // John, Jane and Robert
      const [ john, jane, robert ] = await this.personService.createOrUpdate([
        {
          name: 'John Doe',
          age: 15,
          height: 179.5,
          weight: 76.4,
          preferences: { color: 'blue' },
        },
        {
          name: 'Jane Doe',
          age: 27,
          height: 164.3,
          weight: 63.8,
        },
        {
          name: 'Robert Doe',
          age: 34,
          height: 172.9,
          weight: 87.1,
        },
      ]);

      // Google has a headquarter and 2 branches
      const googleHq = await this.companyService.createOrUpdate({
        name: 'GOOGLE LLC',
        capital: 123456789,
      });

      await this.companyService.createOrUpdate([
        {
          name: 'FACEBOOK LLC',
          capital: 76543210,
          employees: [ robert ] as any,
        },
        {
          name: 'GOOGLE BRASIL LTDA',
          headquarter: googleHq,
          capital: 987654,
          employees: [ john, jane ] as any,
        },
        {
          name: 'GOOGLE MEXICO LTDA',
          headquarter: googleHq,
          capital: 765443,
          employees: [ jane ] as any,
        },
      ]);

      // John has 3 contact methods
      await this.contactService.createOrUpdate([
        {
          type: ContactType.EMAIL,
          value: 'john.doe@google.com',
          person: john,
        },
        {
          type: ContactType.EMAIL,
          value: 'john.doe@facebook.com',
          person: john,
        },
        {
          type: ContactType.PHONE,
          value: '5511999999999',
          primary: true,
          person: john,
        },
        // Jane has 1 contact method
        {
          type: ContactType.EMAIL,
          value: 'jane.doe@facebook.com',
          person: jane,
        },
      ]);

      this.loggerService.notice('[StartupService] Mock data successfully created');
    }
    catch (e) {
      this.loggerService.error(e);
    }
  }

}
