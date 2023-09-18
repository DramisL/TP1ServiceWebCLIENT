//<span class="cmdIcon fa-solid fa-ellipsis-vertical"></span>
let contentScrollPosition = 0;
Init_UI();

function Init_UI() {
    renderFavoris();

    $('#createFavorite').on("click", async function () {
        saveContentScrollPosition();
        rendercreateFavoriteForm();
    });
    $('#abort').on("click", async function () {
        renderFavoris();
    });
    $('#ResetCategoryCmd').on("click", async function () {
        renderFavoris();
    });
    $('#aboutCmd').on("click", function () {
        renderAbout();
    });
}

function renderAbout() {
    saveContentScrollPosition();
    eraseContent();
    $("#createFavorite").hide();
    $("#abort").show();
    $("#actionTitle").text("À propos...");
    $("#content").append(
        $(`
            <div class="aboutContainer">
                <h2>Gestionnaire de favoris</h2>
                <hr>
                <p>
                    Petite application de gestion de favoris à titre de démonstration
                    d'interface utilisateur monopage réactive.
                </p>
                <p>
                    Auteur: Laurent Simard
                    Basé sur le travail initial de : Nicolas Chourot
                </p>
                <p>
                    Collège Lionel-Groulx, automne 2023
                </p>
            </div>
        `))
}
async function renderFavoris(category = null) {
    showWaitingGif();
    $("#actionTitle").text("Liste des favoris");
    $("#createFavorite").show();
    $("#abort").hide();
    let favoris = await Favoris_API.Get();
    let categories = new Array()
    eraseContent();
    if (favoris !== null) {
        if (category === null) {
            favoris.forEach(Favoris => {
                categories = TryAddCategory(Favoris.Category, categories)
                $("#content").append(renderFavori(Favoris));
            });
        } else {
            favoris.forEach(Favoris => {
                if (Favoris.Category == category) {
                    categories = TryAddCategory(Favoris.Category, categories, true)
                    $("#content").append(renderFavori(Favoris));
                }
                else {
                    categories = TryAddCategory(Favoris.Category, categories)
                }
            });
        }
        restoreContentScrollPosition();
        // Attached click events on command icons
        $(".editCmd").on("click", function () {
            saveContentScrollPosition();
            renderEditFavorisForm(parseInt($(this).attr("editFavorisId")));
        });
        $(".deleteCmd").on("click", function () {
            saveContentScrollPosition();
            renderDeleteFavorisForm(parseInt($(this).attr("deleteFavorisId")));
        });
        $(".FavorisRow").on("click", function (e) { e.preventDefault(); })
    } else {
        renderError("Service introuvable");
    }
}
function TryAddCategory(newCategory, categories, selected = false) {
    if (!categories.includes(newCategory)) {
        $("#CategorySelect").append(renderCategorySelect(newCategory, selected));
        categories.push(newCategory)
    }
    return categories
}

function renderCategorySelect(newCategory, selected = false) {
    if (selected) {
        return $(`<input type="button" onclick="renderFavoris('${newCategory}')" value="${newCategory}" class="dropdown-item active">`)
    } else {
        return $(`                   
    <input type="button" onclick="renderFavoris('${newCategory}')" value="${newCategory}" class="dropdown-item">`)
    }
}
function showWaitingGif() {
    $("#content").empty();
    $("#content").append($("<div class='waitingGifcontainer'><img class='waitingGif' src='Loading_icon.gif' /></div>'"));
}
function eraseContent() {
    $("#CategorySelect").empty();
    $("#content").empty();
}
function saveContentScrollPosition() {
    contentScrollPosition = $("#content")[0].scrollTop;
}
function restoreContentScrollPosition() {
    $("#content")[0].scrollTop = contentScrollPosition;
}
function renderError(message) {
    eraseContent();
    $("#content").append(
        $(`
            <div class="errorContainer">
                ${message}
            </div>
        `)
    );
}
function rendercreateFavoriteForm() {
    renderFavorisForm();
}
async function renderEditFavorisForm(id) {
    showWaitingGif();
    let favoris = await Favoris_API.Get(id);
    if (favoris !== null)
        renderFavorisForm(favoris);
    else
        renderError("Favoris introuvable!");
}
async function renderDeleteFavorisForm(id) {
    showWaitingGif();
    $("#createFavorite").hide();
    $("#abort").show();
    $("#actionTitle").text("Retrait");
    let Favoris = await Favoris_API.Get(id);
    eraseContent();
    if (Favoris !== null) {
        $("#content").append(`
        <div class="FavorisdeleteForm">
            <h4>Effacer le Favoris suivant?</h4>
            <br>
            <div class="FavorisRow" Favoris_id=${Favoris.Id}">
                <div class="FavorisContainer">
                    <div class="FavorisLayout">
                        <div class="FavorisTitle">${Favoris.Title}</div>
                        <div class="FavorisUrl">${Favoris.Url}</div>
                        <div class="FavorisCategory">${Favoris.Category}</div>
                    </div>
                </div>  
            </div>   
            <br>
            <input type="button" value="Effacer" id="deleteFavoris" class="btn btn-primary">
            <input type="button" value="Annuler" id="cancel" class="btn btn-secondary">
        </div>    
        `);
        $('#deleteFavoris').on("click", async function () {
            showWaitingGif();
            let result = await Favoris_API.Delete(Favoris.Id);
            if (result)
                renderFavoris();
            else
                renderError("Une erreur est survenue!");
        });
        $('#cancel').on("click", function () {
            renderFavoris();
        });
    } else {
        renderError("Favoris introuvable!");
    }
}
function newFavoris() {
    Favoris = {};
    Favoris.Id = 0;
    Favoris.Title = "";
    Favoris.Url = "";
    Favoris.Category = "";
    return Favoris;
}
function renderFavorisForm(Favoris = null) {
    $("#createFavorite").hide();
    $("#abort").show();
    eraseContent();
    let create = Favoris == null;
    if (create) Favoris = newFavoris();
    $("#actionTitle").text(create ? "Création" : "Modification");
    $("#content").append(`
        <form class="form" id="FavorisForm">
            <input type="hidden" name="Id" value="${Favoris.Id}"/>

            <label for="Title" class="form-label">Titre </label>
            <input 
                class="form-control Alpha"
                name="Title" 
                id="Title" 
                placeholder="Titre"
                required
                RequireMessage="Veuillez entrer un Titre"
                InvalidMessage="Le nom comporte un caractère illégal" 
                value="${Favoris.Title}"
            />
            <label for="Url" class="form-label">Url </label>
            <input
                class="form-control"
                name="Url"
                id="Url"
                placeholder="Url"
                required
                RequireMessage="Veuillez entrer une url"
                value="${Favoris.Url}" 
            />
            <label for="Category" class="form-label">Catégorie </label>
            <input 
                class="form-control"
                name="Category"
                id="Category"
                placeholder="Catégorie"
                required
                RequireMessage="Veuillez entrer un nom de catégorie" 
                value="${Favoris.Category}"
            />
            <hr>
            <input type="submit" value="Enregistrer" id="saveFavoris" class="btn btn-primary">
            <input type="button" value="Annuler" id="cancel" class="btn btn-secondary">
        </form>
    `);
    initFormValidation();
    $('#FavorisForm').on("submit", async function (event) {
        event.preventDefault();
        let Favoris = getFormData($("#FavorisForm"));
        Favoris.Id = parseInt(Favoris.Id);
        showWaitingGif();
        let result = await Favoris_API.Save(Favoris, create);
        if (result)
            renderFavoris();
        else
            renderError("Une erreur est survenue!");
    });
    $('#cancel').on("click", function () {
        renderFavoris();
    });
}

function getFormData($form) {
    const removeTag = new RegExp("(<[a-zA-Z0-9]+>)|(</[a-zA-Z0-9]+>)", "g");
    var jsonObject = {};
    $.each($form.serializeArray(), (index, control) => {
        jsonObject[control.name] = control.value.replace(removeTag, "");
    });
    return jsonObject;
}

function renderFavori(Favoris) {
    return $(`
        <div class="FavorisContainer noselect" id="${Favoris.Id}">
            <div class="FavorisLayout">
                <span class="FavorisTitle">                            
                <div class="big-favicon" style="background-image: url('http://www.google.com/s2/favicons?sz=64&domain=${Favoris.Url}');">
                </div>${Favoris.Title}</span>
                <a href="${Favoris.Url}" target="_blank"> ${Favoris.Category}</a> 
            </div>
            <div class="FavorisCommandPanel">
                <span class="editCmd cmdIcon fa fa-pencil" editFavorisId="${Favoris.Id}" title="Modifier ${Favoris.Title}"></span>
                <span class="deleteCmd cmdIcon fa fa-trash" deleteFavorisId="${Favoris.Id}" title="Effacer ${Favoris.Title}"></span>
            </div>
        </div>           
            `);
}

