
Template.Pedido.onCreated(function () {

});

Template.Pedido.rendered = function () {
  $('input[name="dates"]').daterangepicker();
};


Template.Pedido.helpers({
  idUser() {
    return Meteor.user() ? Meteor.user()._id : false;
  },
  clients() {
    return ClientList.find();
  },
  currentPedido() {
    return Session.get("PedidoSeleccionado");
  },
  flowers() {
    return Flowers.find().map(function (o, i) {
      let img = Images.findOne({
        "meta.flowerId": o._id
      });

      o.img = img ? img.link() : "img/flower.png";
      return o;
    });
  },
  pedidos() {
    let doc = Session.get("FiltroFecha");
    if (doc)
    return Pedidos.find({fecha: {$gt: new Date(doc.inicio), $lt: new Date(doc.fin)}});
    else{
console.log(Pedidos.find());
      return Pedidos.find();
    }

    
  },
  arrP() {
    let arrProductos = Session.get("ArregloProductos")
    if (arrProductos)
      return arrProductos.map(function (p, i) {
        console.log(p);
        p.index = i + 1;  
        p.total = p.producto.precio * p.cantidad;
        return p;
      });
  }
});

Template.Pedido.events({
  "change #seleccionarCliente": function (e) {
    if ($("#seleccionarCliente").val() != "seleccione") {
      let id = $("#seleccionarCliente").val();
      let docSelect = ClientList.findOne({ "_id": id });

      $("#InfoClienteString").val(docSelect.nombre + " " + docSelect.apellido);
    } else {
      swal("error", "favor seleccione cliente", "error");

    }
  },
  "change #seleccionarProducto": function (e) {
    if ($("#seleccionarProducto").val() != "seleccione") {
      let id = $("#seleccionarProducto").val();
      let docSelect = Flowers.findOne({ "_id": id });
      $("#InfoProductoString").val(docSelect.name + " " + docSelect.precio);
    } else {
      swal("error", "favor seleccione producto", "error");

    }
  },
  "click #addp": function (e) {
    Session.set("PedidoSeleccionado", {});
    Session.set("ArregloProductos", []);
    setear();
    $("#modal-ingreso-pedido").show();
  },
  "click #btngap": function () {
    if ($("#seleccionarProducto").val() != "seleccione") {
      let producto = Flowers.findOne({ "_id": $("#seleccionarProducto").val() });
      let cantidad = $("#cantidadProductos").val();
      if (cantidad >= 1) {
        let arrProductos = Session.get("ArregloProductos");
        if (!arrProductos) arrProductos = [];
        let doc = {
          producto: producto,
          cantidad: cantidad
        }
        if (!arrProductos.includes(doc)) {
          arrProductos.push(doc);
        }
        console.log(arrProductos);
        Session.set("ArregloProductos", arrProductos);
      } else {
        swal("error", "debe ingresar almenos 1 producto", "error");

      }
    }
  },
  /*"click #btngap": function (e) {
    let fecha = $("#datepicker").val();

    if (validarFormatoFecha(fecha)) {
      if (existeFecha(fecha)) {
        if (!validarFechaMenorActual(fecha)) {
          if ($("#seleccionarProducto").val() != "seleccione" && $("#seleccionarCliente").val() != "seleccione") {
            let cliente = ClientList.findOne({ "_id": $("#seleccionarCliente").val() });
            let producto = Flowers.findOne({ "_id": $("#seleccionarProducto").val() });
            let cantidad = $("#cantidadProductos").val();

            if (cantidad >= 1) {
              $("#seleccionarCliente").attr("disabled", "disabled");
              $("#inputNombreDetalles").html(cliente.nombre);
              $("#inputdireccionDetalles").html(cliente.calleE + cliente.numeroE + "comuna: " + cliente.comunasE + "region: " + cliente.regionesE);
              let html = '<tr><th scope="row">' + producto.name + '</th><td >' + producto.precio + '</td><td>' + cantidad + '</td><td>' + (cantidad * producto.precio) + '</td><td hidden class="idproducto">' + (producto._id) + '</td></tr>';
              $("#agregardetalles").append(html);
              console.log("agrego a la tabla");
            } else {
              swal("error", "debe ingresar almenos 1 producto", "error");

            }
          } else {

            swal("error", "debe seleccionar cliente y producto", "error");
          }

        } else {
          swal("error", "La fecha introducida es menor a la actual", "error");
        }

      } else {
        swal("error", "La fecha introducida no existe.", "error");
      }
    } else {
      swal("error", "El formato de la fecha es incorrecto.", "error");
    }

  },*/
  "click #btnGp": function () {

    let fecha = $("#datepicker").val();
    let cantidad = $("#cantidadProductos").val();
    if (validarFormatoFecha(fecha)) {
      if (existeFecha(fecha)) {
        if (!validarFechaMenorActual(fecha)) {
          if (Session.get("ArregloProductos") && $("#seleccionarCliente").val() != "seleccione") {
            let pedidodoc = {};
            pedidodoc.cliente = ClientList.findOne({ "_id": $("#seleccionarCliente").val() });
            pedidodoc.productos = Session.get("ArregloProductos");
            pedidodoc.fecha = fecha;
            pedidodoc.valorb = "0";
            let total=0;
              for (let index = 0; index < pedidodoc.productos.length; index++) {
                total+= pedidodoc.productos[index].cantidad*pedidodoc.productos[index].producto.precio;
                
              }
              console.log(total);
              pedidodoc.total=total;
            let pedido = Session.get("PedidoSeleccionado");
            Meteor.call("AddPedido", pedido ? pedido._id : false, pedidodoc, function (err, resp) {
              if (!err) {
                if (!pedido._id) {
                  pedido._id = resp;
                }
                console.log(resp);
              } else console.warn(err);

            });
            swal("guardado", "operacion exitosa", "success");
            $("#modal-ingreso-pedido").hide();
          }


          else {

            swal("error", "debe seleccionar cliente y producto", "error");
          }

        } else {
          swal("error", "La fecha introducida es menor a la actual", "error");
        }

      } else {
        swal("error", "La fecha introducida no existe.", "error");
      }
    } else {
      swal("error", "El formato de la fecha es incorrecto.", "error");
    }


  },

  "click .btn-pedido-delete": function (e) {
    console.log("id: " + e.currentTarget.id);
    Meteor.call("RemovePedido", e.currentTarget.id, function (err, resp) {
      if (!err) {
        swal("borrado", "eliminado", "success");
      }
    });
  },
  "click .btn-pedido-update": function (e) {// solo rellenar form
    $("#modal-ingreso-pedido").show();
    let pedido = Pedidos.findOne({ "_id": e.currentTarget.id })
    Session.set("PedidoSeleccionado", pedido);
    Session.set("ArregloProductos", pedido.productos);

    window.scrollTo(0, 0);

  },
  "click #btnGac": function () {
    setear();
    $("#modal-ingreso-pedido").hide();
  },
  "keyup #datepicker2": function () {

    var fecha1 = $("#datepicker2").val();
    var fecha2 = $("#datepicker3").val();
    doc =
    {
      inicio: fecha1,
      fin: fecha2
    }
    if (validarFormatoFecha(fecha1) && validarFormatoFecha(fecha2))
    {
      console.log("AL FIN");
      Session.set("FiltroFecha", doc);
      
    }
    else {
      console.log("dfknasjdnfaj");
      Session.set("FiltroFecha", null);
    }
  },
  "keyup #datepicker3": function () {
    var fecha1 = $("#datepicker2").val();
    var fecha2 = $("#datepicker3").val();
   
    fecha1.split("/");
    fecha2.split("/");

    doc =
    {
      inicio: fecha1,
      fin: fecha2
    }
    //validarFormatoFecha(fecha1) && validarFormatoFecha(fecha2)
    if (validarFormatoFecha(fecha1) && validarFormatoFecha(fecha2))
    {
      console.log("AL FIN");
      Session.set("FiltroFecha", doc);
      
    }
    else {
      console.log("dfknasjdnfaj");
      Session.set("FiltroFecha", null);
    }
  }





});
function setear() {

  $("#InfoProductoString").val("");
  $("#cantidadProductos").val("");
  $("#seleccionarProducto").val("seleccione");
  $("#InfoClienteString").val("");
  $("#seleccionarCliente").val("seleccione");
  $("#seleccionarCliente").removeAttr("disabled");
  $("#datepicker").val("");

};
function validarFormatoFecha(campo) {
  var RegExPattern = /^\d{1,2}\/\d{1,2}\/\d{2,4}$/;
  if ((campo.match(RegExPattern)) && (campo != '')) {
    return true;
  } else {
    return false;
  }
}
function existeFecha(fecha) {
  console.log(fecha);
  var fechaf = fecha.split("/");
  var day = fechaf[0];
  var month = fechaf[1];
  var year = fechaf[2];
  var date = new Date(year, month, '0');
  if ((day - 0) > (date.getDate() - 0)) {
    return false;

  } else {
    return true;
  }
}

function existeFecha2(fecha) {
  var fechaf = fecha.split("/");
  var d = fechaf[0];
  var m = fechaf[1];
  var y = fechaf[2];
  return m > 0 && m < 13 && y > 0 && y < 32768 && d > 0 && d <= (new Date(y, m, 0)).getDate();
}
function validarFechaMenorActual(date) {
  var x = new Date();
  var fecha = date.split("/");
  x.setFullYear(fecha[2], fecha[1] - 1, fecha[0]);
  var today = new Date();

  if (x >= today)
    return false;
  else
    return true;
}
