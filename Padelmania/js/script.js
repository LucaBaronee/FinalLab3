var urlCategorias = 'https://api.yumserver.com/16990/generic/categories';
var urlProductos = 'https://api.yumserver.com/16990/generic/products';
let categoriasMap = {};
document.querySelector('.buscador input').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        alert('Buscando: ' + e.target.value);
    }
});

function mostrarMensajeABM(texto, tipo = "info") {
    let mensaje = document.getElementById("mensajeAbmGlobal");
    if (!mensaje) {
        mensaje = document.createElement("div");
        mensaje.id = "mensajeAbmGlobal";
        document.body.appendChild(mensaje);
    }

    mensaje.textContent = texto;
    mensaje.className = tipo === "error" ? "mensaje-abm error" : "mensaje-abm";
    mensaje.style.display = "block";

    setTimeout(() => {
        mensaje.style.display = "none";
    }, 3000);
}
function CargarCategoriasEnSelect() {
    return fetch(urlCategorias)
    .then(res => res.json())
    .then(data => {
        categoriasMap  ={}; 
        const selectAgregar = document.getElementById("selectCategoriaProducto");
        selectAgregar.innerHTML = `<option value="">Seleccionar categoría</option>`; // limpia

        const selectModificar = document.getElementById('selectModificarCategoria');
        selectModificar.innerHTML = `<option value="">Seleccionar categoría</option>`;


        data.forEach(categoria => {
            categoriasMap[categoria.idcod] = categoria.param1;
            const opcion = document.createElement("option");
            opcion.value = categoria.idcod;
            opcion.textContent = categoria.param1;
            selectAgregar.appendChild(opcion);
            
            const opcionModificar = document.createElement("option");
            opcionModificar.value = categoria.idcod;
            opcionModificar.textContent = categoria.param1;
            selectModificar.appendChild(opcionModificar);
        });
    });
}
// PRODUCTOS
function CrearProducto() {
    let idcategoria = document.getElementById('selectCategoriaProducto').value.trim();
    let marca = document.getElementById('agregarMarca').value.trim();
    let modelo = document.getElementById('agregarModelo').value.trim();
    let precio = document.getElementById('agregarPrecio').value.trim();

    if (!marca || !modelo || !precio || !idcategoria) {
        return mostrarMensajeABM("Todos los campos de producto son obligatorios", "error");
    }

    if (isNaN(precio)) {
        return mostrarMensajeABM("El precio debe ser un número", "error");
    }

    fetch(urlProductos, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            param1: idcategoria,
            param2: marca,
            param3: modelo,
            param4: precio,
        })
    })
    
    .then(() => {
        mostrarMensajeABM("Producto creado");
        // Limpia los inputs del formulario
        document.getElementById('selectCategoriaProducto').value = '';
        document.getElementById('agregarMarca').value = '';
        document.getElementById('agregarModelo').value = '';
        document.getElementById('agregarPrecio').value = '';
        // Vuelve a cargar los productos
        CargarProductos();
    })
    .catch(err => {
        console.error("Error en la creación:", err);
        mostrarMensajeABM("Error al crear producto", "error");
    });
}

function ModificarProducto() {
    let id = document.getElementById("modificarId").value.trim();
    let idcategoria = document.getElementById("selectModificarCategoria").value.trim();
    let marca = document.getElementById("modificarMarca").value.trim();
    let modelo = document.getElementById("modificarModelo").value.trim();
    let precio = document.getElementById("modificarPrecio").value.trim();

    if (!id) return mostrarMensajeABM("ID inválido", "error");

    let productoActualizado = { idcod: id };
    if (idcategoria) productoActualizado.param1 = idcategoria;
    if (marca) productoActualizado.param2 = marca;
    if (modelo) productoActualizado.param3 = modelo;
    if (precio) {
        if (isNaN(precio)) return mostrarMensajeABM("El precio debe ser un número", "error");
        productoActualizado.param4 = precio;
    }

    if (Object.keys(productoActualizado).length === 0) {
        return mostrarMensajeABM("No hay campos para modificar", "error");
    }

    fetch(urlProductos, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productoActualizado)
    })
    .then(res => {
        if (!res.ok) throw new Error("Error al modificar producto");
        return res.text();
    })
    .then(() => {
        mostrarMensajeABM("Producto modificado");
        document.getElementById("modificarId").value = '';
        document.getElementById("modificarIdCategoria").value = '';
        document.getElementById("modificarMarca").value = '';
        document.getElementById("modificarModelo").value = '';
        document.getElementById("modificarPrecio").value = '';
        CargarProductos();
    })
    .catch(() => mostrarMensajeABM("Error al modificar producto", "error"));
}

function EliminarProducto(idcod) {
    if (confirm("¿Estás seguro que querés eliminar este producto?")) {
        fetch(urlProductos, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idcod: String(idcod) })
        })
        .then(res => {
            if (!res.ok) throw new Error("Error al eliminar producto");
            return res.text(); // evita error si la API devuelve texto plano
        })
        .then(() => {
            mostrarMensajeABM("Producto eliminado");
            CargarProductos();
        })
        .catch(() => mostrarMensajeABM("Error al eliminar producto", "error"));
    }
}

function CargarFormularioProducto(idcod, idcategoria,marca, modelo, precio) {
    document.getElementById("modificarId").value = idcod;
    const select = document.getElementById("selectModificarCategoria");
    select.value = idcategoria || 
    Array.from(select.options).find(opt => opt.textContent === idcategoria)?.value || "";
    document.getElementById("modificarMarca").value = marca;
    document.getElementById("modificarModelo").value = modelo;
    document.getElementById("modificarPrecio").value = precio;
    mostrarMensajeABM(`Editando producto ID ${idcod}`);
}

function CargarProductos() {
    fetch(urlProductos)
    .then(res => res.json())
    .then(data => {
        console.log("Productos cargados desde la API:", data)
        const tabla = document.getElementById("contenidoTabla");
        tabla.innerHTML = "";
        data.forEach(({ idcod, param1, param2, param3,param4 }) => {
            const fila = document.createElement("tr");

            fila.innerHTML = `
                <td>${idcod}</td>
                <td>${categoriasMap[param1] || `ID ${param1}`}</td>
                <td>${param2}</td>
                <td>${param3}</td>
                <td>${param4}</td>
                <td>
                    <button class="editarProducto">Editar</button>
                    <button class="eliminarProducto">Eliminar</button>
                </td>
            `;

            fila.querySelector(".editarProducto").addEventListener("click", () => {
                CargarFormularioProducto(idcod, param1, param2, param3, param4);
            });

            fila.querySelector(".eliminarProducto").addEventListener("click", () => {
                EliminarProducto(idcod);
            });

            tabla.appendChild(fila);
        });
    });
}

//CATEGORIAS
function CrearCategoria() {
    let nombre = document.getElementById("agregarParam1").value.trim();
    if(!nombre) return mostrarMensajeABM("El nombre de la categoría es obligatorio", "error");

    fetch(urlCategorias, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ param1: nombre })
    })
    .then(res => {
        if (res.ok) {
            mostrarMensajeABM("Categoría creada");
            CargarCategorias();
        } else {
            mostrarMensajeABM("Error al crear categoría", "error");
        }
    });
}

function ModificarCategoria() {
    let id = document.getElementById("modificarIdCategoria").value;
    let nombre = document.getElementById("modificarParam1").value.trim();
    if(!nombre) return mostrarMensajeABM("El nombre de la categoría es obligatorio", "error");

    let categoriaActualizada = { idcod: id};
    if (nombre) categoriaActualizada.param1 = nombre;

    if (Object.keys(categoriaActualizada).length === 0) {
        return mostrarMensajeABM("No hay campos para modificar", "error");
    }

    fetch(urlCategorias, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoriaActualizada)
    })
    .then(res => {
        if (!res.ok) throw new Error("Error al modificar categoría");
        return res.text();
    })
    .then(() => {
        mostrarMensajeABM("Categoría modificada");
        document.getElementById("modificarIdCategoria").value = '';
        document.getElementById("modificarParam1").value = '';
        CargarCategorias();
    })
    .catch(() => mostrarMensajeABM("Error al modificar categoría", "error"));
}

function EliminarCategoria(idcod) {
    if (confirm("¿Estas seguro que quieres eliminar esta categoría?")) {

        console.log("Borrando ID:", idcod);

        fetch(urlCategorias, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idcod: String(idcod) })
        })
        .then(res => {
                if (!res.ok) throw new Error("Error al eliminar producto");
                return res.text(); // evita error si la API devuelve texto plano
        })
        .then(() => {
            mostrarMensajeABM("Categoría eliminada");
            CargarCategorias();
        })
        .catch(() => mostrarMensajeABM("Error al eliminar categoría", "error"));
    };
}

function CargarFormularioCategoria(idcod, nombre) {
    document.getElementById("modificarIdCategoria").value = idcod;
    document.getElementById("modificarParam1").value = nombre;
    mostrarMensajeABM(`Editando categoría ID ${idcod}`);
}

function CargarCategorias() {
    fetch(urlCategorias)
    .then(res => res.json())
    .then(data => {
        const tabla = document.getElementById("contenidoTablaCategorias");
        tabla.innerHTML = "";

        data.forEach(({ idcod, param1 }) => {
            const fila = document.createElement("tr");

            fila.innerHTML = `
                <td>${idcod}</td>
                <td>${param1}</td>
                <td>
                    <button class="editarCategoria">Editar</button>
                    <button class="eliminarCategoria">Eliminar</button>
                </td>
            `;

            fila.querySelector(".editarCategoria").addEventListener("click", () => {
                CargarFormularioCategoria(idcod, param1);
            });

            fila.querySelector(".eliminarCategoria").addEventListener("click", () => {
                EliminarCategoria(idcod);
            });

            tabla.appendChild(fila);
        });
    });
}


document.addEventListener("DOMContentLoaded", () => {
    CargarCategorias();
    CargarCategoriasEnSelect().then(() => {
        CargarProductos();
    });
});