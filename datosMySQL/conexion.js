var mysql = require('mysql');
var Conexion = function(){
  this.con = mysql.createConnection({
    host: 'localhost',
    port: '3306',
    user: 'javier',
    password: 'javier'
});
}
Conexion.prototype.conectarBD = function(callback){
 var sThis = this;    
 this.con.connect(function(err) {
    if (err) {  
     return callback(err,"Error de conexion a la base de datos",null);     
    }else {         
    return callback(false,"La conexion a la base de datos ha sido correcta",sThis.getConnection());
    }  
  });
}
Conexion.prototype.desconectarBD = function(){
  this.con.destroy();
//  return callback(null,"Desconectado correctamente a la base de datos");
}

Conexion.prototype.getConnection = function(){
  return this.con;
}
module.exports = Conexion;
