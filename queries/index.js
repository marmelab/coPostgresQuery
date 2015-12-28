import selectOne from './selectOne';
import selectPage from './selectPage';
import deleteOne from './deleteOne';
import updateOne from './updateOne';
import insertOne from './insertOne';

export default function (table, identifiers = ['id'], fields) {

    return {
        selectOne: selectOne(table, identifiers, fields),
        selectPage: selectPage(table, fields),
        deleteOne: deleteOne(table, identifiers, fields),
        updateOne: updateOne(table, identifiers, fields),
        insertOne: insertOne(table, fields)
    };
}
