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
      // Google has a headquarter and 2 branches
      const googleHq = await this.companyService.upsert({
        name: 'GOOGLE LLC',
        capital: 123456789,
      });

      const googleBrazil = await this.companyService.upsert({
        name: 'GOOGLE BRASIL LTDA',
        headquarter: googleHq,
        capital: 987654,
      });

      const googleMexico = await this.companyService.upsert({
        name: 'GOOGLE MEXICO LTDA',
        headquarter: googleHq,
        capital: 765443,
      });

      // Facebook has no relationships
      const facebook = await this.companyService.upsert({
        name: 'FACEBOOK LLC',
        capital: 76543210,
      });

      // John works for Google and Facebook
      const john = await this.personService.upsert({
        name: 'John Doe',
        age: 30,
        height: 179.5,
        weight: 76.4,
        employers: [ googleBrazil, facebook ],
        preferences: { color: 'blue' },
      });

      // Jane works for Google
      const jane = await this.personService.upsert({
        name: 'Jane Doe',
        age: 27,
        height: 164.3,
        weight: 63.8,
        employers: [ googleMexico ],
      });

      // Robert is unemployed
      await this.personService.upsert({
        name: 'Robert Doe',
        age: 34,
        height: 172.9,
        weight: 87.1,
      });

      // John has 3 contact methods
      await this.contactService.upsert({
        type: ContactType.PHONE,
        value: '5511999999999',
        primary: true,
        person: john,
      });

      await this.contactService.upsert({
        type: ContactType.EMAIL,
        value: 'john.doe@google.com',
        person: john,
      });

      await this.contactService.upsert({
        type: ContactType.EMAIL,
        value: 'john.doe@facebook.com',
        person: john,
      });

      // Jane has 1 contact method
      await this.contactService.upsert({
        type: ContactType.EMAIL,
        value: 'jane.doe@facebook.com',
        person: jane,
      });

      this.loggerService.notice('[StartupService] Mock data successfully created');
    }
    catch (e) {
      this.loggerService.error(e);
    }
  }

}
