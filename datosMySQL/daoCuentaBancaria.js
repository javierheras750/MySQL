var DaoCuentaBancaria = function(){

}

DaoCuentaBancaria.prototype.insertarTablaCuentaBancaria = function(id,saldo,connection,callback){
  var sql ='INSERT INTO clientes.cuentaBancaria VALUES("' + id +'","' + saldo + '")';     
  connection.query(sql,
        function (err, results, fields) {
          if (err) {
           return callback(err,"Error de inserccion en la tabla cuentaBancaria");
          } else {
           return callback(null,"Todo correcto en la inserccion de la tabla cuentaBancaria");
          }
        });
}

DaoCuentaBancaria.prototype.borrarRegistroTablaCuentaBancaria = function(id,connection,callback){
  var sql ='DELETE FROM clientes.cuentaBancaria WHERE id = "' + id + '"';     
  connection.query(sql,
        function (err, results, fields) {
         if (err) 
         {
           callback(err,"Error de Borrado en la tabla cuentaBancaria");
         } else {
           callback(null,"Borrado correcto en la tabla cuentaBancaria");
         }
        });
}

DaoCuentaBancaria.prototype.modificarRegistroTablaCuentaBancaria = function(id,saldo,connection,callback){
  var sql = 'update clientes.cuentaBancaria set id ="' + id + '",' + ' saldo ="' + saldo + '" WHERE id = "'+  id + '"';   
  connection.query(sql,
        function (err, results, fields) {
         if (err) 
         {
           callback(err,"Error de modificacion en la tabla cuentaBancaria",null);
         } else {
           callback(false,"Modificacion correcta en la tabla cuentaBancaria",results);
         }
        });
}


/* DaoCuentaBancaria.prototype.crearTablaCuentaBancaria = function(connection,callback) {
  connection.query('CREATE TABLE IF NOT EXISTS clientes.cuentaBancaria(id Varchar(30) primary key not null, saldo int, FOREIGN KEY (id) REFERENCES usuario(dni))',
    function (err, results, fields) {
     if (err) 
     {
       callback(err);
     }
     else {
       callback(null);
     }      
   });  
} */
module.exports = DaoCuentaBancaria;
