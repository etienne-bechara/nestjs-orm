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
      const [ johnDoe, johnSmith, robertDoe ] = await this.personService.readOrCreate([
        {
          name: 'John',
          surname: 'Doe',
          age: 15,
          height: 179.5,
          weight: 76.4,
          preferences: { color: 'blue' },
        },
        {
          name: 'John',
          surname: 'Smith',
          age: 27,
          height: 164.3,
          weight: 63.8,
        },
        {
          name: 'Robert',
          surname: 'Doe',
          age: 34,
          height: 172.9,
          weight: 87.1,
        },
      ]);

      // Google has a headquarter and 2 branches
      const googleHq = await this.companyService.upsertOne({
        name: 'GOOGLE LLC',
        capital: 123456789,
      });

      await this.companyService.upsert([
        {
          name: 'FACEBOOK LLC',
          capital: 76543210,
          employees: [ robertDoe ],
        },
        {
          name: 'GOOGLE BRASIL LTDA',
          headquarter: googleHq,
          capital: 987654,
          employees: [ johnDoe, johnSmith ],
        },
        {
          name: 'GOOGLE MEXICO LTDA',
          headquarter: googleHq,
          capital: 765443,
          employees: [ johnSmith ],
        },
      ]);

      // John Doe has 3 contact methods
      await this.contactService.upsert([
        {
          type: ContactType.EMAIL,
          value: 'john.doe@google.com',
          person: johnDoe,
        },
        {
          type: ContactType.EMAIL,
          value: 'john.doe@facebook.com',
          person: johnDoe,
        },
        {
          type: ContactType.PHONE,
          value: '5511999999999',
          primary: true,
          person: johnDoe,
        },
        // John Smith has 1 contact method
        {
          type: ContactType.EMAIL,
          value: 'john.smith@facebook.com',
          person: johnSmith,
        },
      ]);

      this.loggerService.notice('[StartupService] Mock data successfully created');
    }
    catch (e) {
      this.loggerService.error(e);
    }
  }

}
