import { Injectable, LoggerService } from '@bechara/nestjs-core';

import { CompanyRepository } from '../company/company.repository';
import { ContactType } from '../contact/contact.enum';
import { ContactRepository } from '../contact/contact.repository';
import { PersonRepository } from '../person/person.repository';

@Injectable()
export class StartupService {

  public constructor(
    private readonly contactRepository: ContactRepository,
    private readonly companyRepository: CompanyRepository,
    private readonly loggerService: LoggerService,
    private readonly personRepository: PersonRepository,
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
      const [ johnDoe, johnSmith, robertDoe ] = await this.personRepository.upsert([
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
      const googleHq = await this.companyRepository.upsertOne({
        name: 'GOOGLE LLC',
        capital: 123_456_789,
      });

      await this.companyRepository.upsert([
        {
          name: 'FACEBOOK LLC',
          capital: 76_543_210,
          employees: [ robertDoe ],
        },
        {
          name: 'GOOGLE BRASIL LTDA',
          headquarter: googleHq,
          capital: 987_654,
          employees: [ johnDoe, johnSmith ],
        },
        {
          name: 'GOOGLE MEXICO LTDA',
          headquarter: googleHq,
          capital: 765_443,
          employees: [ johnSmith ],
        },
      ]);

      // John Doe has 3 contact methods
      await this.contactRepository.upsert([
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
