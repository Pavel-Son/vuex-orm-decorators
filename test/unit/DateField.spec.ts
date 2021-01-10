import { DateField } from '@/attributes';
import { Model } from '@vuex-orm/core';
import { ORMDatabase } from '@/database';
import { OrmModel } from '@/model';
import { Store } from 'vuex';
import DateType from '@/plugins/Date/DateType';

describe('DateField', () => {
    it('can define `date` field', () => {
        @OrmModel('users')
        class User extends Model {

            @DateField() created_at!: Date;

        }

        expect(new User().created_at).toBeInstanceOf(Date);
        expect(User.getFields().created_at).toBeInstanceOf(DateType);
        expect((User.getFields().created_at as DateType).isNullable).toBe(false);
    });

    it('can define `date` field with default value', () => {
        const defaultDate = new Date();

        @OrmModel('users')
        class User extends Model {

            @DateField(defaultDate) created_at!: Date;

        }

        const user = new User();

        expect(user.created_at).toBeInstanceOf(Date);
        expect(user.created_at.toDateString()).toEqual(defaultDate.toDateString());
        expect(user.created_at.toUTCString()).toEqual(defaultDate.toUTCString());
        expect(User.getFields().created_at).toBeInstanceOf(DateType);
        expect((User.getFields().created_at as DateType).isNullable).toBe(false);
    });

    it('can define `date` field with null value', () => {
        @OrmModel('users')
        class User extends Model {

            @DateField(null) created_at!: Date;

        }

        expect(new User().created_at).toBe(null);
        expect(User.getFields().created_at).toBeInstanceOf(DateType);
        expect((User.getFields().created_at as DateType).isNullable).toBe(true);
    });

    it('parses proper dates to date instance', () => {
        @OrmModel('users')
        class User extends Model {

            @DateField() created_at!: Date;

        }

        new Store({
            plugins: [ORMDatabase.install()],
        });

        User.insert({ data: [
            { created_at: '2020-12-30T12:15:45.000Z' },
            { created_at: '1609330545000' },
            { created_at: 1609330545000 },
        ] });

        User.all().forEach(user => {
            expect(user.created_at).toBeInstanceOf(Date);
            expect(user.created_at.toDateString()).toEqual('Wed Dec 30 2020');
            expect(user.created_at.toUTCString()).toEqual('Wed, 30 Dec 2020 12:15:45 GMT');
        });

        expect(User.getFields().created_at).toBeInstanceOf(DateType);
        expect((User.getFields().created_at as DateType).isNullable).toBe(false);
    });

    it('can mutate the given value', () => {
        @OrmModel('users-1')
        class User extends Model {

            @DateField(null, (value: Date) => {
                const mutated = value.setDate(value.getDate() + 1);

                return new Date(mutated);
            }) created_at!: Date;

        }

        new Store({
            plugins: [ORMDatabase.install()],
        });

        User.insert({ data: { created_at: '2020-12-30T12:15:45.000Z' } });

        const user = User.query().first();

        expect(user?.created_at).toBeInstanceOf(Date);
        expect(user?.created_at.toDateString()).toEqual('Thu Dec 31 2020');
        expect(User.getFields().created_at).toBeInstanceOf(DateType);
        expect((User.getFields().created_at as DateType).isNullable).toBe(false);
    });
});