var DaoCuentaBancaria = require('./daoCuentaBancaria');
var Usuario = require('../modelo/usuario');
var Cuenta = require('../modelo/cuentaBancaria');
var Conexion = require('./conexion');
var DaoUsuario = function () {
  this.daoCuentaBancaria = new DaoCuentaBancaria();
  this.conexion = new Conexion();
}
DaoUsuario.prototype.insertarUsuario = function (usuario, callback) {
  var sThis = this;
  //Conectamos con la base de datos
  this.conexion.conectarBD(function (err, mensaje, connection) {
    if (err) {
      return callback(err, mensaje);
    }
    else {
      var zThis = sThis;
      //Guardamos los datos 
      sThis.existeUsuario(usuario.getDni(), connection, function (err, mensaje, existe) {
        if (err) {
          return callback(err, mensaje);
        } else {
          if (existe) {
            callback(true, mensaje);
          } else {
            zThis.dni = usuario.getDni();
            zThis.nombre = usuario.getNombre();
            zThis.primerApellido = usuario.getPrimerApellido();
            zThis.segundoApellido = usuario.getSegundoApellido();
            var cuenta = usuario.getCuenta();
            zThis.id = cuenta.getId();
            zThis.saldo = cuenta.getSaldo();
            zThis.con = connection;
            var aThis = zThis;
            zThis.insertarTablaUsuario(zThis.dni, zThis.nombre, zThis.primerApellido, zThis.segundoApellido, zThis.con,
              function (err, mensaje) {
                if (err) {
                  return callback(err, mensaje)
                } else {
                  var conexion = aThis.con;
                  aThis.daoCuentaBancaria.insertarTablaCuentaBancaria(aThis.dni, aThis.saldo, conexion, function (err) {
                    if (err) {
                      return callback(err, mensaje);
                    } else {
                      //Desconectamos de la base datos
                      zThis.conexion.desconectarBD();
                      return callback(null, "Todo correcto en la inserccion de usuario");
                    }
                  });
                }
              });
          }
        }
      });
    }
  });
};
DaoUsuario.prototype.borrarUsuario = function (dni, callback) {
  this.dni = dni;
  var sThis = this;
  //Conectamos con la base de datos
  this.conexion.conectarBD(function (err, mensaje, connection) {
    sThis.connection = connection;
    if (err) {
      return callback(err, mensaje);
    }
    else {
      var zThis = sThis;
      //Guardamos los datos 
      sThis.existeUsuario(sThis.dni, sThis.connection, function (err, mensaje, existe) {
        if (err) {
          return callback(err, mensaje);
        } else {
          if (!existe) {
            return callback(true, mensaje);
          } else {
            //Borramos los datos en la tabla relacionada y despues en la principal          
            zThis.daoCuentaBancaria.borrarRegistroTablaCuentaBancaria(zThis.dni, zThis.connection,
              function (err) {
                if (err) {
                  return callback(err, mensaje)
                } else {
                  zThis.borrarRegistroTablaUsuario(zThis.dni, zThis.connection,
                    function (err) {
                      if (err) {
                        return callback(err, mensaje);
                      } else {
                        //Desconectamos de la base datos                    
                        zThis.conexion.desconectarBD();
                        return callback(null, "Todo correcto en el borrado de usuario");
                      }
                    })
                }
              });
          }
        }
      });
    }
  });
}
DaoUsuario.prototype.getUsuarios = function (callback) {
  var sThis = this;
  //Conectamos con la base de datos
  this.conexion.conectarBD(function (err, mensaje, connection) {
    if (err) {
      return callback(err, mensaje);
    }
    else {
      var sql = 'SELECT dni,nombre,primerApellido,segundoApellido,saldo FROM clientes.usuario, clientes.cuentabancaria WHERE clientes.usuario.dni=clientes.cuentabancaria.id';
      connection.query(sql,
        function (err, results, fields) {
          if (err) {
            callback(err, "Error en el query de lectura", null);
          } else {
            if (!results) {
              callback(null, false, null);
            }
            else {
              //insertamos los datos en objetos
              var usuariosJSON = [];
              for (i = 0; i < results.length; i++) {
                usuario = new Usuario();
                cuenta = new Cuenta();
                var registro = results[i];
                usuario.setDni(registro.dni);
                usuario.setNombre(registro.nombre);
                usuario.setPrimerApellido(registro.primerApellido);
                usuario.setSegundoApellido(registro.segundoApellido);
                cuenta.setId(registro.dni);
                cuenta.setSaldo(registro.saldo);
                usuario.setCuenta(cuenta);
                var usuarioJson = usuario.getJSON();
                usuariosJSON[i] = usuarioJson;
              }
              //Desconectamos de la base datos
              sThis.conexion.desconectarBD();
              return callback(null, "Todo correcto en la lectura de usuarios", usuariosJSON);
            }
          }
        });
    }
  });
}




DaoUsuario.prototype.existeUsuario = function (dni, connection, callback) {
  var sql = 'SELECT * FROM clientes.usuario, clientes.cuentabancaria WHERE clientes.usuario.dni=clientes.cuentabancaria.id AND clientes.usuario.dni="' + dni + '"';
  connection.query(sql,
    function (err, results, fields) {
      if (err) {
        callback(err, "Error de lectura en el query", null);
      } else {
        if (results.length == 1) {
          callback(null, "El usuario ya existe en la base de datos", true);
        }
        else {
          callback(null, "El usuario no existe en la base datos", false);
        }
      }
    });
}

DaoUsuario.prototype.insertarTablaUsuario = function (dni, nombre, primerApellido, segundoApellido, connection, callback) {
  var sql = 'INSERT INTO clientes.usuario VALUES("' + dni + '","' + nombre + '","' + primerApellido +
    '","' + segundoApellido + '")';
  connection.query(sql,
    function (err, results, fields) {
      if (err) {
        callback(err, "Error de inserccion en la tabla usuario, la clave primaria ya existe");
      } else {
        callback(null, "Todo correcto en la inserccion de la tabla de usuario");
      }
    });
};


DaoUsuario.prototype.modificarRegistroTablaUsuario = function (dni, nombre, primerApellido, segundoApellido, connection, callback) {
  var sql = 'update clientes.usuario set nombre ="' + nombre + '",' + ' primerApellido ="' + primerApellido + '",' +
    ' segundoApellido ="' + segundoApellido + '" WHERE dni = "' + dni + '"';
  console.log(sql);
  connection.query(sql,
    function (err, results, fields) {
      if (err) {
        return callback(err, "Error de modificacion en la tabla usuario",null);
      } else {
        return callback(false, "Todo correcto en la modificacion de la tabla de usuario",results);
      }
    });
};




DaoUsuario.prototype.borrarRegistroTablaUsuario = function (dni, connection, callback) {
  var sql = 'DELETE FROM clientes.usuario WHERE dni = "' + dni + '"';
  connection.query(sql,
    function (err, results, fields) {
      if (err) {
        callback(err, "Error de Borrado en la tabla usuario");
      } else {
        callback(null, "Borrado correcto en la tabla usuario");
      }
    });
}

DaoUsuario.prototype.modificarUsuario = function (usuario, callback) {
  this.usuario = usuario;
  var sThis = this;
  //Conectamos con la base de datos
  this.conexion.conectarBD(function (err, mensaje, connection) {
    sThis.connection = connection;
    if (err) {
      return callback(err, mensaje);
    }
    else {      
            //Guardamos los datos
            var aThis = sThis;       
                //Modificar datos
                aThis.dni = usuario.getDni();
                aThis.nombre = usuario.getNombre();
                aThis.primerApellido = usuario.getPrimerApellido();
                aThis.segundoApellido = usuario.getSegundoApellido();
                var cuenta = usuario.getCuenta();
                aThis.id = cuenta.getId();
                aThis.saldo = cuenta.getSaldo(); 
                var zThis = aThis;              
                aThis.modificarRegistroTablaUsuario(aThis.dni, aThis.nombre, aThis.primerApellido, aThis.segundoApellido, aThis.connection, function(err,mensaje,results){
                  if (err) {
                    return callback(err, mensaje);
                  }else {
                    zThis.daoCuentaBancaria.modificarRegistroTablaCuentaBancaria(zThis.dni, zThis.saldo, zThis.connection, function (err,mensaje,results) {
                      return callback(err,mensaje);                      
                    });
                  } 
                });
            
            


            /* if (err) {
              callback(err)
            } else {
             
                if (err) {
                  callback(err)
                }
                else {
                  //Desconectamos de la base datos                    
                  zThis.conexion.desconectarBD();
                  return callback(null, "Todo correcto en el borrado de usuario");
                }
              });
            }
          }); */
        
          
    }
  });
}


DaoUsuario.prototype.getUsuario = function (dni, callback) {
  var sThis = this;
  //Conectamos con la base de datos
  this.conexion.conectarBD(function (err, mensaje, connection) {
    if (err) {
      return callback(err, mensaje, null);
    }
    else {
      var sql = 'SELECT dni,nombre,primerApellido,segundoApellido,saldo FROM clientes.usuario, clientes.cuentabancaria WHERE clientes.usuario.dni=clientes.cuentabancaria.id and clientes.usuario.dni="' + dni + '"';
      connection.query(sql,
        function (err, results, fields) {
          if (err) {
            return callback(err, "Imposible la conexion con la base de datos", null);
          } else {
            if (results.length == 0) {
              return callback(true, "No existe ningun usuario con ese dni", null);
            }
            else {
              //insertamos el dato en el objeto
              var usuarioJSON = [];
              for (i = 0; i < results.length; i++) {
                usuario = new Usuario();
                cuenta = new Cuenta();
                var registro = results[i];
                usuario.setDni(registro.dni);
                usuario.setNombre(registro.nombre);
                usuario.setPrimerApellido(registro.primerApellido);
                usuario.setSegundoApellido(registro.segundoApellido);
                cuenta.setId(registro.dni);
                cuenta.setSaldo(registro.saldo);
                usuario.setCuenta(cuenta);
                var usuarioJson = usuario.getJSON();
                usuarioJSON[i] = usuarioJson;
              }
               //Desconectamos de la base datos     
               sThis.conexion.desconectarBD();  
              return callback(false,"El usuario es correcto para modificar", usuarioJSON[0]);
            }
          }
        });
    }
  });
}

module.exports = DaoUsuario;

/* DaoUsuario.prototype.crearTablaUsuario = function (connection, callback) {
  connection.query('CREATE TABLE IF NOT EXISTS clientes.usuario(dni Varchar(30) primary key not null, nombre Varchar(30), primerApellido Varchar(30), segundoApellido Varchar(30))',
    function (err, results, fields) {
      if (err) {
        callback(err);
      } else {
        callback(null);
      }
    });
}
DaoUsuario.prototype.crearTablas = function (connection, callback) {
  var sThis = this;
  this.crearTablaUsuario(connection, function (err) {
    if (err) {
      callback(err);
    } else {
      sThis.daoCuentaBancaria.crearTablaCuentaBancaria(connection, function (err) {
        if (err) {
          callback(err);
        } else {
          callback(null);
        }
      });
    }
  })


} */









