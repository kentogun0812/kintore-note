import 'package:drift/drift.dart';
import 'package:drift/web.dart';

QueryExecutor connect(String dbName) {
  return WebDatabase(dbName);
}
