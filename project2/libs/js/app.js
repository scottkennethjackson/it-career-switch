// Display the nav dropdown when the user clicks the menu button
const menuClick = document.querySelector("#menu-button");
const navDropdown = document.querySelector("#dropdown-container");

menuClick.addEventListener("click", function() {
    menuClick.classList.toggle("active");
    navDropdown.classList.toggle("visible");
});

// Reset the the menu button and dropdown when the user clicks a nav button
window.onclick = function(e) {
    if (e.target.matches(".nav-button")) {
        if (menuClick.classList.contains("active")) {
            menuClick.classList.remove("active");
        };

        if (navDropdown.classList.contains("visible")) {
            navDropdown.classList.remove("visible");
        };
    };
};

// Reset the menu button and dropdown when the use leaves the nav menu
const navReset = document.querySelector("#menu-container");

navReset.addEventListener("mouseleave", function() {
    menuClick.classList.remove("active");
    navDropdown.classList.remove("visible");
});

// Display the filter dropdown when the user clicks the filter button
const filterClick = document.querySelector("#filter-button");
const filterDropdown = document.querySelector("#filter-dropdown");
const tableShift = document.querySelector("#first-row");

filterClick.addEventListener("click", function() {
    filterClick.classList.toggle("active");
    filterDropdown.classList.toggle("visible");
    tableShift.classList.toggle("shift");
});

// Establish reusable variables
let newEmployee = {
    firstName: "",
    lastName: "",
    email: "",
    department: "Select Department",
    departmentID: "reset",
    location: "Select Location",
    locationID: "reset",
    id: "not assigned"
};

let staticResults;
let searchDept;
let searchLoc;

let results = [];
let searchResults = [];
let departments = [];
let departmentOptions = [];
let locations = [];

let validateString = "";
let locationForEditedDepartment = 0;

// Get staff, department and location info
$(window).on("load", function () {
    initialiseData();
});

const initialiseData = () => {
    $.ajax({
        url: "libs/php/getAll.php",
        type: "GET",
        dataType: "json",
        crossOrigin: "",
        success: function (result) {
            console.log("libs/php/getAll.php: ajax call successful");
            displayStaffData(result);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(`libs/php/getAll.php: ajax call failed ${textStatus}. ${errorThrown}. ${jqXHR}.`);
        }
    });

    $.ajax({
        url: "libs/php/getAllDepartment.php",
        type: "GET",
        dataType: "json",
        crossOrigin: "",
        success: function (result) {
            console.log("libs/php/getAllDepartments.php: ajax call successful");
            getDepartmentData(result);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(`libs/php/getAllDepartments.php: ajax call failed ${textStatus}. ${errorThrown}. ${jqXHR}.`);
        }
    });

    $.ajax({
        url: "libs/php/getAllLocations.php",
        type: "GET",
        dataType: "json",
        crossOrigin: "",
        success: function (result) {
            console.log("libs/php/getAllLocations.php: ajax call successful");
            getLocationData(result);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(`libs/php/getAllLocations.php: ajax call failed ${textStatus}. ${errorThrown}. ${jqXHR}.`);
        }
    });
};

// Populate the directory
const displayStaffData = (data) => {
    if (data.data) {
        staticResults = data.data;
        results = data.data;
    } else {
        results = data;
    };

    $("#first-row").html("");

    results.forEach((employee) => {
        $("#first-row").append(
            `<tr key=${employee.id} data-id=${employee.id}>
                <td class="employee-col">
                    <p id="name-data">${employee.lastName.toUpperCase()}, ${employee.firstName}</p>
                </td>
                <td class="email-col">
                    <p id="email-data">${employee.email}</p>
                </td>
                <td class="department-col">
                    <p id="department-data">${employee.department}</p>
                </td>
                <td class="location-col">
                    <p id="location-data">${employee.location}</p>
                </td>
                <td class="button-col">
                    <div class="button-container">
                        <div class="edit-buttons">
                            <button id="view${employee.id}" class="trafficlight-button view" aria-label="View">
                                <i class="fa-solid fa-solid fa-eye"></i>
                            </button>
                            <button id="edit${employee.id}" class="trafficlight-button edit" aria-label="Edit">
                                <i class="fa-solid fa-user-pen"></i>
                            </button>
                            <button id="delete${employee.id}" class="trafficlight-button delete" aria-label="Delete">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    </div>
                </td>
            </tr>`
        );

        setTimeout(function () {
            $("#preloader-container").fadeOut(2000);
        }, 1000);

        $(".view").click(function() {
            let selectedEmployeeID = $(this).closest("tr").attr("data-id");

            $(".view-employee").show(viewStaff(selectedEmployeeID));
        });

        $(".edit").click(function () {
            let selectedEmployeeID = $(this).closest("tr").attr("data-id");

            $.ajax({
                url: "libs/php/getPersonnelByID.php",
                type: "GET",
                dataType: "json",
                data: {
                    param1: selectedEmployeeID
                },
                crossOrigin: "",
                success: function (result) {
                    console.log("libs/php/getPersonnelByID.php: ajax call successful");
                    editStaff(result);
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log(`libs/php/getPersonnelByID.php: ajax call failed ${textStatus}. ${errorThrown}. ${jqXHR}.`);
                }
            })
        });

        $(".delete").click(function() {
            let selectedEmployeeID = $(this).closest("tr").attr("data-id");

            $(".view-employee").show(deleteStaff(selectedEmployeeID));
        });
    });
};

// Open and populate the employee modal when the user clicks the green "view" button
const viewStaff = (id) => {
    let result = staticResults.filter((result) => result.id === id);

    $("#verb").html("View");
    $("#noun").html("Employee");
    $("#full-name").html(`${result[0].firstName} ${result[0].lastName}`);
    $("#view-department").html(`${result[0].department}`);
    $("#view-location").html(`${result[0].location}`);
    $("#email-address").html(`<a href="mailto:${result[0].email}">${result[0].email}</a>`);
    $("#extra-info").modal("show");
};

// Open and populate the employee modal when the user clicks the yellow "edit" button
const editStaff = (data) => {
    let result = data.data.personnel;
    departments = data.data.department;

    buildForm(result);

    $("#verb").html("Edit");
    $("#noun").html("Employee");
    $("#forename").val(result.firstName);
    $("#surname").val(result.lastName);
    $("#email").val(result.email);
    $("#modal-select-dept").val(result.departmentID);

    newEmployee.id = result.id;

    $("#extra-info").modal("show");
    $(".add-edit-form").show();
};

// Populate the employee modal's dropdowns
const buildForm = () => {
    $("#modal-select-dept").html(`<option selected value="reset">Select Department</option>`);

    departments.forEach((department) => {
        $("#modal-select-dept").append(`<option value="${department.id}">${department.name}</option>`);
    });

    $("#modal-select-dept").change(function (e) {
        let selectedDept = e.currentTarget.value;

        if (selectedDept !== "reset" && selectedDept !== "resetSubset") {
            let locationHunt = departments.find((department) => department.id === selectedDept);

            $("#modal-select-loc").val(locationHunt.locationID);
        } else if (searchDept === "reset") {
            $("#modal-select-loc").val("reset");
        };
    });

    $("#modal-select-loc").html(`<option selected value="reset">Select Location</option>`);

    locations.forEach((location) => {
        $("#modal-select-loc").append(`<option value="${location.id}">${location.name}</option>`);
    });

    $("#modal-select-loc").change(function (e) {
        let selectedLoc = e.currentTarget.value;

        if (selectedLoc === "reset") {
            departments.forEach((department) => {
                $("#modal-select-dept").append(`<option value="${department.id}">${department.name}<deleteStaff/option>`);
            });
        } else {
            departmentOptions = departments.filter((department) => department.locationID === selectedLoc);

            $("#modal-select-dept").html("");

            if (departmentOptions.length > 1) {
                $("#modal-select-dept").append(`<option value="resetSubset">Select Department</option>`);
            };

            departmentOptions.forEach((departmentAtLocation) => {
                $("#modal-select-dept").append(`<option value="${departmentAtLocation.id}">${departmentAtLocation.name}</option>`);
            });
        };
    });
};

// Open and populate the employee modal when the user clicks the red "delete" button
const deleteStaff = (id) => {
    viewStaff(id);

    $("#verb").html("Delete");
    $("#noun").html("Employee");

    $("#validation-text").html(
        `<div class="alert">
            <p>Are you sure you want to delete this employee?</p>
            <div class="yes-no-container">
                <button id="confirm-delete" class="yes">
                    Yes
                </button>
                <button class="cancel-delete close no">
                    No
                </button>
            </div>
        </div>`
    );

    $("#confirm-delete").on("click", function () {
        resetData();

        $.ajax({
            url: "libs/php/deletePersonnelByID.php",
            type: "GET",
            dataType: "json",
            data: {
                param1: id
            },
            crossOrigin: "",
            success: function (result) {
                console.log("libs/php/deletePersonnelByID.php: ajax call successful");
                getDeleteConfirmation(result);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(`libs/php/deletePersonnelByID.php: ajax call failed ${textStatus}. ${errorThrown}. ${jqXHR}.`);
            }
        });
    });

    $(".close").on("click", function () {
        closeModal();
    });
};

const getDeleteConfirmation = (data) => {
    closeModal();
    initialiseData();

    if (data.data.includes("Denied")) {
        $("#validation-text").html(`<div class="alert alert-danger">${data.data}</div>`);
    } else {
        $("#validation-text").html(`<div class="alert alert-success">${data.data}</div>`);
    }

    $("#extra-info").modal("show");
};

// Reset modal and filter data
const resetData = () => {
    displayStaffData(staticResults);

    newEmployee = {
        firstName: "",
        lastName: "",
        email: "",
        department: "Select Department",
        departmentID: "reset",
        location: "Select Location",
        locationID: "reset",
        id: "not assigned"
    };

    $(".search-names").val("");
    $("#filter-dept").val("reset");
    $("#filter-loc").val("reset");
};

// Reset data when the user closes the modal
$(".close").click(function () {
    closeModal();
});

const closeModal = () => {
    $("#validation-text").html("");
    $(".modal").modal("hide");
    $(".add-edit-form").hide();
    $(".view-employee").hide();
    $(".new-department-form").hide();
    $(".new-location-form").hide();
};

// Populate the filter and department modal's dropdowns
const getDepartmentData = (data) => {
    departments = data.data;

    $("#filter-dept").html(`<option selected value="reset">Filter Departments</option>`);

    departments.forEach((department) => {
      $("#filter-dept").append(`<option value="${department.id}">${department.name}</option>`);
    });
};
  
const getLocationData = (data) => {
    locations = data.data;

    $("#filter-loc").html(`<option selected value="reset">Filter Locations</option>`);

    locations.forEach((location) => {
      $("#filter-loc").append(`<option value="${location.name}">${location.name}</option>`);
    });
};

// Open the employee modal when the user clicks the add employee button
$("#add-employee").click(function (e) {
    e.preventDefault();

    $("#verb").html("Add")
    $("#noun").html("Employee")
    $("#forename").val("");
    $("#surname").val("");
    $("#email").val("");
    $("#modal-select-dept").val("reset");
    $("#modal-select-loc").val("reset");

    newEmployee.id = "not assigned";

    buildForm(newEmployee);

    $("#extra-info").modal("show");
    $(".add-edit-form").show();
});

// Update employee data and check for any duplication when the user clicks the save button
$("#employee-form").on("submit", function(e) {
    e.preventDefault()

    newEmployee.firstName = $("#forename")
    .val()
    .toLowerCase()
    .replace(/(\b[a-z](?!\s))/g, function (x) {
      return x.toUpperCase();
    });

    validateField("employee's first name", newEmployee.firstName, 2, 15, lastNameCheck);
});

const lastNameCheck = () => {
    newEmployee.lastName = $("#surname")
    .val()
    .toLowerCase()
    .replace(/(\b[a-z](?!\s))/g, function (x) {
      return x.toUpperCase();
    });

    validateField("employee's last name", newEmployee.lastName, 2, 20, departmentCheck);
};

const departmentCheck = () => {
    newEmployee.departmentID = $("#modal-select-dept").val();
    newEmployee.locationID = $("#modal-select-loc").val();

    if ( newEmployee.departmentID === "reset" || newEmployee.departmentID === "resetSubset" || newEmployee.locationID === "reset") {
        validateString = "Employee must be associated with a department and a location";
        validationWarning(validateString);
    } else {
        newEmployee.email = $("#email").val().toLowerCase();
        newEmployee.id !== "not assigned" ? validateField("email", newEmployee.email, 6, 40, updatePersonnel) : validateField("email", newEmployee.email, 6, 40, emailDuplicationCheck);
    };
};

const updatePersonnel = () => {
    $.ajax({
        url: "libs/php/updateEmployee.php",
        type: "GET",
        dataType: "json",
        data: {
            param1: newEmployee.firstName,
            param2: newEmployee.lastName,
            param3: newEmployee.email,
            param4: newEmployee.departmentID,
            param5: newEmployee.id
        },
        crossOrigin: "",
        success: function (result) {
            console.log("libs/php/updateEmployee.php: ajax call successful");
            getEditConfirmation(result);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(`libs/php/updateEmployee.php: ajax call failed ${textStatus}. ${errorThrown}. ${jqXHR}.`);
        }
    });
};

const getEditConfirmation = (data) => {
    closeModal();
    initialiseData();

    $("#validation-text").html(
        `<div class="alert alert-success">
            ${data.data[0]}'s information has successfully been updated
        </div>`
    );

    $("#extra-info").modal("show");
};

const emailDuplicationCheck = () => {
    if (staticResults.find((staff) => staff.email === newEmployee.email)) {
        validateString = "There is already an employee with this email address";
        validationWarning(validateString);
    } else {
        $.ajax({
            url: "libs/php/insertEmployee.php",
            type: "POST",
            dataType: "json",
            data: {
                param1: newEmployee.firstName,
                param2: newEmployee.lastName,
                param3: newEmployee.email,
                param4: newEmployee.departmentID
            },
            crossOrigin: "",
            success: function (result) {
                console.log("libs/php/insertEmployee.php: ajax call successful");
                getAddConfirmation(result);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(`libs/php/insertEmployee.php: ajax call failed ${textStatus}. ${errorThrown}. ${jqXHR}.`);
            }
        });
    };
};

const getAddConfirmation = (data) => {
    closeModal();
    initialiseData();

    $("#validation-text").html(
        `<div class="alert alert-success">
            <p>${data.data[0]}</p>
        </div>`
    );

    $("#extra-info").modal("show");
};

// Open and populate the department modal when the user clicks the manage departments button
$("#manage-departments").click(function (e) {
    e.preventDefault();
    
    $("#verb").html("Manage");
    $("#noun").html("Departments")

    editDepartmentData();
});

const editDepartmentData = () => {
    $.ajax({
        url: "libs/php/getAllDepartments.php",
        type: "GET",
        dataType: "json",
        crossOrigin: "",
        success: function (result) {
            console.log("libs/php/getAllDepartments.php: ajax call successful");
            getDepartmentData(result);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(`libs/php/getAllDepartments.php: ajax call failed ${textStatus}.  ${errorThrown}. ${jqXHR}.`);
        },
    });

    $("#new-department").val("");
    $("#list-departments").html("");

    departments.forEach((departmentToChange) => {
        $("#list-departments").append(
            `<div class="department-flex" key=${departmentToChange.id}>
                <div class="dept-to-change">
                    <p>${departmentToChange.name}</p>
                </div>
                <div class="modify-buttons-container">
                    <button id="edit${departmentToChange.id}" class="trafficlight-button edit">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button id="delete${departmentToChange.id}" class="trafficlight-button delete">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </div`
        );

        $("#list-departments").on("click", `#edit${departmentToChange.id}`, function () {
            $.ajax({
                url: "libs/php/getDepartmentByID.php",
                type: "GET",
                dataType: "json",
                data: {
                    param1: departmentToChange.id
                },
                crossOrigin: "",
                success: function (result) {
                    console.log("libs/php/getDepartmentByID.php: ajax call successful")
                    editDepartmentForm(result);
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log(`libs/php/getDepartmentByID.php: ajax call failed ${textStatus}.  ${errorThrown}. ${jqXHR}.`);
                },
            })
        });

        $("#list-departments").on("click", `#delete${departmentToChange.id}`, function () {
            $.ajax({
                url: "libs/php/deleteDepartmentByID.php",
                type: "GET",
                dataType: "json",
                data: {
                    param1: departmentToChange.id,
                    param2: departmentToChange.name
                },
                crossOrigin: "",
                success: function (result) {
                    console.log("libs/php/deleteDepartmentByID.php: ajax call successful")
                    if (result.count > 0) {
                        $("#validation-text").html(`<div class="alert alert-danger">${result.data}</div>`);
                    } else {
                        $("#validation-text").html(
                            `<div class="alert">
                                <p>Are you sure you want to delete the ${departmentToChange.name} department?</p>
                                <div class="yes-no-container">
                                    <button id="confirm-dept-delete" class="yes">
                                        Yes
                                    </button>
                                    <button class="cancel-delete close no">
                                        No
                                    </button>
                                </div>
                            </div>`
                        );

                        $("#confirm-dept-delete").on("click", function () {
                            closeModal();
                            initialiseData();

                            $("#validation-text").html(`<div class="alert alert-success">${result.data}</div>`);
                            $("#extra-info").modal("show");
                        });

                        $(".close").on("click", function () {
                            $("#validation-text").html("");
                        });
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log(`libs/php/deleteDepartmentByID.php: ajax call failed ${textStatus}.  ${errorThrown}. ${jqXHR}.`);
                },
            });
        });
    });

    $("#department-loc").html(
        `<option selected value="reset">Select Location</option>`
    );

    locations.forEach((location) => {
        $("#department-loc").append(
            `<option value="${location.id}" loc-name="${location.name}">${location.name}</option>`
        );
    });

    $(".new-department-form").show();
    $("#extra-info").modal("show");
};

const editDepartmentForm = (data) => {
    let departmentToChange = data.data;

    $(".new-department-form").hide();

    $("#validation-text").html(
        `<div class="alert">
            <div class="new-dept-container">
                <label for="new-department-name" class="form-label title">
                    <p>Department</p>
                </label>
                <input type="text" name="new-department-name" id="new-department-name" class="form-contol" autocapitalize="words">
            </div>
            <div class="new-loc-container">
                <label for="new-location" class="form-label title">
                    <p>Location</p>
                </label>
                <select name="new-location" id="new-location" class="form-select">
                    <option selected value="reset">
                        Select Location
                    </option>
                </select>
            </div>
            <br>
            <div class="modal-button-container">
                <button id="confirm-edit-dept" class="save-button" data=${departmentToChange.id}>
                    Save
                </button>
                <button class="cancel-button close">
                    Cancel
                </button>
            </div class="modal-button-container">
        </div>`
    );

    $("#new-location").html(`<option selected value="reset">Select Location</option>`);

    locations.forEach((location) => {
        $("#new-location").append(`<option value="${location.id}">${location.name}</option>`);
    });

    $("#new-department-name").val(departmentToChange.name);
    $("#new-location").val(departmentToChange.locationID);

    $("#confirm-edit-dept").on("click", function () {
        let departmentName = $("#new-department-name")
        .val()
        .toLowerCase()
        .replace(/(\b[a-z](?!\s))/g, function (x) {
            return x.toUpperCase();
        });

        locationForEditedDepartment = $("#new-location").val();

        validateField("new department", departmentName, 2, 30, callUpdateDepartment, departmentToChange.id);
    });

    $(".close").on("click", function () {
        $("#validation-text").html("");
    });
};

const callUpdateDepartment = (department, departmentID) => {
    departmentName = $("#new-department-name").val();

    if (departments.find((department) => department.name === departmentName)) {
        validateString = `${department} already exists`;
        validationWarning(validateString);
    } else {
        $.ajax({
            url: "libs/php/updateDepartment.php",
            type: "GET",
            dataType: "json",
            data: {
                param1: department,
                param2: locationForEditedDepartment,
                param3: departmentID
            },
            crossOrigin: "",
            success: function (result) {
                console.log("libs/php/updateDepartment.php: ajax call successful");
                getEditConfirmation(result);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(`libs/php/updateDepartment.php: ajax call failed ${textStatus}.  ${errorThrown}. ${jqXHR}.`);
            }
        });
    }

    /*$.ajax({
        url: "libs/php/updateDepartment.php",
        type: "GET",
        dataType: "json",
        data: {
            param1: department,
            param2: locationForEditedDepartment,
            param3: departmentID
        },
        crossOrigin: "",
        success: function (result) {
            console.log("libs/php/updateDepartment.php: ajax call successful");
            getEditConfirmation(result);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(`libs/php/updateDepartment.php: ajax call failed ${textStatus}.  ${errorThrown}. ${jqXHR}.`);
        }
    });*/
};

// Update department data and check for any duplication when the user clicks the save button
$("#department-form").on("submit", function(e) {
    e.preventDefault();

    let departmentName = $("#new-department")
    .val()
    .toLowerCase()
    .replace(/(\b[a-z](?!\s))/g, function (x) {
        return x.toUpperCase();
    });

    validateField("new department", departmentName, 2, 20, lastDepartmentCheck);
});

const lastDepartmentCheck = (departmentName) => {
    let locationID = $("#department-loc").val();

    if (locationID === "reset") {
        validateString = "Departments must be associated with a location";
        validationWarning(validateString);
    } else if (departments.find((department) => department.name === departmentName)) {
        validateString = `${departmentName} already exists`;
        validationWarning(validateString);
    } else {
        let location = locations.find((location) => location.id === locationID);
        let locationName = location.name;

        $.ajax({
            url: "libs/php/insertDepartment.php",
            type: "GET",
            dataType: "json",
            data: {
                param1: departmentName,
                param2: locationID,
                param3: locationName
            },
            crossOrigin: "",
            success: function (result) {
                console.log("libs/php/insertDepartment.php: ajax call successful");
                getNewDeptConfirmation(result);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(`libs/php/insertDepartment.php: ajax call failed ${textStatus}.  ${errorThrown}. ${jqXHR}.`);
            }
        });
    };
};

const getNewDeptConfirmation = (data) => {
    initialiseData();
    closeModal();

    $("#validation-text").html(
        `<div class="alert alert-success">
            <p>${data.data}</p>
        </div>`
    );

    $("#extra-info").modal("show");
};

const deleteDeptConfirmation = (data) => {
    closeModal();
    initialiseData();

    $("#validation-text").html(`<div class="alert alert-success">${data.data} department successfully deleted</div>`);
    $("#extra-info").modal("show");
};

// Open and populate the location modal when the user clicks the manage locations button
$("#manage-locations").click(function (e) {
    e.preventDefault();

    $("#verb").html("Manage");
    $("#noun").html("Locations");
    
    editLocationData();
});

const editLocationData = () => {
    $.ajax({
        url: "libs/php/getAllLocations.php",
        type: "GET",
        dataType: "json",
        crossOrigin: "",
        success: function (result) {
            console.log("libs/php/getAllLocations.php: ajax call successful");
            getLocationData(result);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(`libs/php/getAllLocations.php: ajax call failed ${textStatus}.  ${errorThrown}. ${jqXHR}.`);
        }
    });

    $("#new-location").val("");
    $("#list-locations").html("");

    locations.forEach((locationToChange) => {
        $("#list-locations").append(
            `<div class="location-flex" key=${locationToChange.id}>
                <div class="loc-to-change">
                    <p>${locationToChange.name}</p>
                </div>
                <div class="modify-buttons-container">
                    <button id="edit${locationToChange.id}" class="trafficlight-button edit">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button id="delete${locationToChange.id}" class="trafficlight-button delete">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </div>`
        );

        $("#list-locations").on("click", `#edit${locationToChange.id}`, function () {
            $.ajax({
                url: "libs/php/getLocationByID.php",
                type: "GET",
                dataType: "json",
                data: {
                    param1: locationToChange.id
                },
                crossOrigin: "",
                success: function (result) {
                    console.log("libs/php/getLocationByID.php: ajax call successful");
                    editLocationForm(result);
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log(`libs/php/getLocationByID.php: ajax call failed ${textStatus}.  ${errorThrown}. ${jqXHR}.`);
                }
            });
        });

        $("#list-locations").on("click", `#delete${locationToChange.id}`, function () {
            $.ajax({
                url: "libs/php/deleteLocationByID.php",
                type: "GET",
                dataType: "json",
                data: {
                    param1: locationToChange.id,
                    param2: locationToChange.name
                },
                crossOrigin: "",
                success: function (result) {
                    console.log("libs/php/deleteLocationByID.php: ajax call successful");
                    if (result.count > 0) {
                        $("#validation-text").html(`<div class="alert alert-danger">${result.data}</div>`);
                    } else {
                        $("#validation-text").html(
                            `<div class="alert">
                                <p>Are you sure you want to delete the ${locationToChange.name} office?</p>
                                <div class="yes-no-container">
                                    <button id="confirm-loc-delete" class="yes">
                                        Yes
                                    </button>
                                    <button class="cancel-delete close no">
                                        No
                                    </button>
                                </div>
                            </div>`
                        );

                        $("#confirm-loc-delete").on("click", function () {
                            closeModal();
                            initialiseData();

                            $("#validation-text").html(`<div class="alert alert-success">${result.data}</div>`);
                            $("#extra-info").modal("show");
                        });

                        $(".close").on("click", function () {
                            $("#validation-text").html("");
                        });
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log(`libs/php/deleteLocationByID.php: ajax call failed ${textStatus}.  ${errorThrown}. ${jqXHR}.`);
                }
            });
        });
    });

    $(".new-location-form").show();
    $("#extra-info").modal("show");
};

const editLocationForm = (data) => {
    let locationToChange = data.data;

    $(".new-location-form").hide();

    $("#validation-text").html(
        `<div class="alert">
            <div class=new-loc-container>
                <label for="new-location-name" class="form-label title">
                    <p>Location</p>
                </label>
                <input type="text" name="new-location-name" id="new-location-name" class="form-contol" autocapitalize="words">
            </div>
            <br>
            <div class="modal-button-container">
                <button id="confirm-edit-loc" class="save-button" data=${locationToChange.id}>
                    Save
                </button>
                <button class="cancel-button close">
                    Cancel
                </button>
            </div>
        </div>`
    );

    $("#new-location-name").val(locationToChange.name);

    $("#confirm-edit-loc").on("click", function () {
        $("#modal-select-loc").html(`<option selected value="reset">Select Location</option>`);

        locations.forEach((location) => {
            $("#modal-select-loc").append(`<option value="${location.id}">${location.name}</option>`);
        });

        let location = $("#new-location-name")
        .val()
        .toLowerCase()
        .replace(/(\b[a-z](?!\s))/g, function (x) {
            return x.toUpperCase();
        });

        validateField("new location", location, 2, 20, lastUpdateLocationCheck, locationToChange.id);
    });

    $(".close").on("click", function () {
        $("#validation-text").html("");
    });
};

const lastUpdateLocationCheck = (location, locationID) => {
    if (locations.find((office) => office.name === location)) {
        validateString = `${location} already exists`;
        validationWarning(validateString);
    } else {
        $.ajax({
            url: "libs/php/updateLocation.php",
            type: "GET",
            dataType: "json",
            data: {
                param1: location,
                param2: locationID
            },
            crossOrigin: "",
            success: function (result) {
                console.log("libs/php/updateLocation.php: ajax call successful");
                getEditConfirmation(result);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(`libs/php/updateLocation.php: ajax call failed ${textStatus}.  ${errorThrown}. ${jqXHR}.`);
            },
        });
    };
};

const deleteLocConfirmation = () => {
    closeModal();
    initialiseData();

    $("#validation-text").html(`<div class="alert alert-success">Location successfully deleted</div>`);
    $("#extra-info").modal("show");
};

// Update location data and check for any duplication when the user clicks the save button
$("#location-form").on("submit", function(e) {
    e.preventDefault();

    let location = $("#new-location")
    .val()
    .toLowerCase()
    .replace(/(\b[a-z](?!\s))/g, function (x) {
      return x.toUpperCase();
    });

    validateField("new location", location, 2, 20, lastLocationCheck);
});

const lastLocationCheck = (location) => {
    if (locations.find((office) => office.name === location)) {
        validateString = `${location} already exists`;
        validationWarning(validateString);
    } else {
        $.ajax({
            url: "libs/php/insertLocation.php",
            type: "GET",
            dataType: "json",
            data: {
                param1: location
            },
            crossOrigin: "",
            success: function (result) {
                console.log("libs/php/insertLocation.php: ajax call successful");
                getNewLocConfirmation(result);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(`libs/php/insertLocation.php: ajax call failed ${textStatus}.  ${errorThrown}. ${jqXHR}.`);
            }
        });
    }
};

const getNewLocConfirmation = (data) => {
    closeModal();
    initialiseData();

    $("#validation-text").html(
        `<div class="alert alert-success">
            <p>${data.data}</p>
        </div>`
    );

    $("#extra-info").modal("show");
};

// Filter names, departments and locations when the user inputs/selects perameters
$(".search-names").on("input", function (e) {
    let nameToSearch = e.currentTarget.value.toLowerCase().trim();
    let searchData = $("#filter-dept").val() === "reset" && $("#filter-loc").val() === "reset" ? staticResults : searchResults;

    results = searchData.filter((result) => {
        result.fullName = result.firstName.toLowerCase() + " " + result.lastName.toLowerCase();
        return result.fullName.includes(nameToSearch);
    });

    displayStaffData(results);
});

$("#filter-dept").on("change", function (e) {
    searchDept = e.currentTarget.value;

    if (searchDept === "reset") {
        resetData();
    } else {
        const searchData = results;
        results = searchData.filter((result) => result.departmentID === searchDept);
        searchResults = results;

        displayStaffData(results);
    };
});

$("#filter-loc").on("change", function (e) {
    searchLoc = e.currentTarget.value;

    if (searchLoc === "reset") {
        resetData();
    } else {
        const searchData = results;
        results = searchData.filter((result) => result.location === searchLoc);
        searchResults = results;

        displayStaffData(results);
    };
});

// Reset filters when the user clicks the reset button
$("#reset-button").click(function () {
    resetData();
});

// Validate data
const validateField = (field, fieldInput, min, max, lastCheckCallback, extraField) => {
    if (fieldInput.length > max || fieldInput.length < min) {
        validateString = `The ${field} must be between ${min} and ${max} characters`;
        validationWarning(validateString);
    } else {
        validatePattern(field, fieldInput, lastCheckCallback, extraField);
    };
};

const validationWarning = (validateString) => {
    $("#validation-text").html(
        `<div class="alert alert-danger">
            <p><strong>Error!</strong><br>${validateString}</p>
        </div>`
    );
};

const validatePattern = (field, fieldInput, lastCheckCallback, extraField) => {
    if (field === "email") {
        if (!fieldInput.match(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)) {
            validateString = `${fieldInput} is not a properly-formatted email address`;
            validationWarning(validateString);
        } else {
            lastCheckCallback(fieldInput);
        };
    } else {
        if (!fieldInput.match(/^[A-Za-z -]+$/)) {
            validateString = `${field} must not contain any unusual characters`;
            validationWarning(validateString);
        } else {
            lastCheckCallback(fieldInput, extraField);
        };
    };
};
