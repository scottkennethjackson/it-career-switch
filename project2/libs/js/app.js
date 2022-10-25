// Preloader script
// Script goes <--here-->

// Display the nav dropdown when the user clicks the menu button
const menuClick = document.querySelector("#menu-button");
const navDropdown = document.querySelector("#nav-menu");

menuClick.addEventListener("click", function() {
    menuClick.classList.toggle("active");
    navDropdown.classList.toggle("visible");
});

// Reset the the menu button and dropdown when the user clicks a nav button
window.onclick = function(event) {
    if (event.target.matches(".nav-button")) {
        if (menuClick.classList.contains("active")) {
            menuClick.classList.remove("active");
        }
        if (navDropdown.classList.contains("visible")) {
            navDropdown.classList.remove("visible");
        }
    }
};

// Reset the menu button and dropdown when the user leaves the nav menu
const navReset = document.querySelector("#menu-container")

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
    department: "Select Department",
    departmentID: "reset",
    location: "Select Location",
    locationID: "reset",
    email: "",
    id: "not assigned",
};

// Establish full data set
let staticResults;

// Establish dropdown list search terms
let searchDept;
let searchLoc;

// Establish temporary results based on filters
let results = [];
let searchResults = [];
let locations = [];
let departments = [];
let departmentOptions = [];

// Establish variables used to send validation errors
let validateString = "";
let locationForEditedDepartment = 0;

// Get staff, department and location info
$(window).on("load", function () {
    initialiseData();
})

const initialiseData = () => {
    $("#validation-text").html("");
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
            console.log(`libs/php/getAll.php: ajax call failed ${textStatus}. ${errorThrown}. ${jqXHR}`);
        },
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
            console.log(`libs/php/getAllDepartments.php: ajax call failed ${textStatus}. ${errorThrown}. ${jqXHR}`);
        },
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
            console.log(`libs/php/getAllLocations.php: ajax call failed ${textStatus}. ${errorThrown}. ${jqXHR}`);
        },
    });
};

// Display staff data and the results of filtered searches
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
            `<tr class="row" key=${employee.id}>
                <td class="employee-col">
                    <p id="name-data">
                        ${employee.firstName} ${employee.lastName.toUpperCase()}
                    </p>
                </td>
                <td class="department-col">
                    <p id="department-data">
                        ${employee.department}
                    </p>
                </td>
                <td class="location-col">
                    <p id="location-data">
                        ${employee.location}
                    </p>
                </td>
                <td class="button-col">
                    <div class="button-container">
                        <div class="edit-buttons">
                            <button id="view${employee.id}" class="trafficlight-button view" aria-label="View">
                                <i class="fa-solid fa-eye"></i>
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

        $("#first-row").on("click", `#view${employee.id}`, function () {
            $(".view-employee").show(viewStaff(employee.id));
        });

        $("#first-row").on("click", `#edit${employee.id}`, function () {
            $("#validation-text").html("");
            $.ajax({
                url: "libs/php/getAllLocations.php",
                type: "GET",
                dataType: "json",
                data: "getLocationData",
                crossOrigin: "",
                success: function (result) {
                    console.log("libs/php/getAllLocations.php: ajax call successful")
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log(
                        `libs/php/getAllLocations.php: ajax call failed ${textStatus}.  ${errorThrown}. ${jqXHR}`
                    );
                },
            });

            $(".add-editform").show(
                $("#validation-text").html(""),
                $.ajax({
                    url: "libs/php/getPersonnelById.php",
                    type: "GET",
                    dataType: "json",
                    data: "employee.id",
                    crossOrigin: "",
                    success: function (result) {
                        console.log("libs/php/getPersonnelById.php: ajax call successful");
                        editStaff(result);
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        console.log(
                            `libs/php/getPersonnelById.php: ajax call failed ${textStatus}.  ${errorThrown}. ${jqXHR}`
                        );
                    },
                })
            );
        });

        $("#first-row").on("click", `#delete${employee.id}`, function () {
            $(".view-employee").show(deleteStaff(employee.id));
        });
    });
};

// Display department data and the results of filtered searches
const getDepartmentData = (data) => {
    departments = data.data;
    $("#filter-dept").html(
      `<option value="reset" selected>Filter Departments</option>`
    );

    departments.forEach((department) => {
      $("#filter-dept").append(
        `<option value="${department.id}">${department.name}</option>`
      );
    });
  };
  
  // Display location data and the results of filtered searches
  const getLocationData = (data) => {
    locations = data.data;
    $("#filter-loc").html(
      `<option value="reset" selected>Filter Locations</option>`
    );

    locations.forEach((location) => {
      $("#filter-loc").append(
        `<option value="${location.name}">${location.name}</option>`
      );
    });
  };

// Show and hide modal commands
$(".close").click(function (e) {
    closeModal();
});

const closeModal = () => {
    $("#validation-text").html("");
    $(".modal").modal("hide");
    $(".add-edit-form").hide();
    $("view-employee").hide();
    $(".new-department-form").hide();
    $(".new-location-form").hide();
};

// Open modal to view an employee record
const viewStaff = (id) => {
    let result = staticResults.filter((result) => result.id === id);
    $("#full-name").html(`${result[0].firstName} ${result[0].lastName}`);
    $("#view-department").html(`${result[0].department}`);
    $("#view-location").html(`${result[0].location}`);
    $("#email-address").html(`${result[0].email}`);
    $("#extra-info").modal("show");
};

// Open modal to edit an employee record
const editStaff = (data) => {
    let result = data.data.personnel;
    departments = data.data.department;

    buildForm(result, "Edit");

    $("#forename").val(result.firstName);
    $("#surname").val(result.lastName);
    $("#modal-select-dept").val(result.departmentID);
    $("#email").val(result.email);

    newEmployee.id = result.id;
    let employeeLocation = locations.find(
        (location) => location.name === result.locationName
    );
    
    result.locationID = employeeLocation.id;
    $("#modal-select-loc").val(result.locationID);

    $("#extra-info").modal("show");
};

// Open modal to delete an employee record
const deleteStaff = (id) => {
    viewStaff(id);
    $("#validation-text").html(
        `<div class="alert alert-warning">
            <p>
                Are you sure you want to delete this employee?
            </p>
            <div class="yes-no-container">
                <button id="confirm-delete" class="yes">
                    Yes
                </button>
                <button id="cancel-delete" class="close no">
                    No
                </button>
            </div>
        </div>`
    );

    $(".close").on("click", function () {
        closeModal();
    });

    $("#confirm-delete").on("click", function () {
        resetData();
        $("#validation-text").html("");
        $.ajax({
            url: "libs/php/deletePersonnelById.php",
            type: "GET",
            dataType: "json",
            data: "id",
            crossOrigin: "",
            success: function (result) {
                console.log("libs/php/deletePersonnelById.php: ajax call successful");
                deleteConfirmation(result);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(`libs/php/deletePersonnelById.php: ajax call failed ${textStatus}. ${errorThrown}. ${jqXHR}`);
            },
        });
    });
};

const deleteConfirmation = (data) => {
    closeModal();
    initialiseData();
    $("#extra-info").modal("show");
    $("#validation-text").html(
        `<div class="alert alert-info">
            ${data.data}
        </div>`
    );
};

// Open modal to create a new employee record
$("#add-employee").click(function (event) {
    event.preventDefault();
    $("#forename").val("");
    $("#surname").val("");
    $("#modal-select-dept").val("reset");
    $("#modal-select-loc").val("reset");
    $("#email").val("");
    newEmployee.id = "not assigned";

    buildForm(newEmployee, "Add");
    $(".add-edit-form").show();
    $("#extra-info").modal("show");
});

const buildForm = (verb) => {
    $("#verb").html(verb);
    $("#noun").html("Employee")

    $("#modal-select-dept").html(`<option value="reset" selected>Select Department</option>`)
    departments.forEach((department) => {
        $("#modal-select-dept").append(`<option value="${department.id}">${department.name}</option>`);
    });

    $("#modal-select-loc").html(`<option value="reset" selected>Select Location</option>`);
    locations.forEach((location) => {
        $("#modal-select-loc").append(`<option value="${location.id}">${location.name}</option>`);
    });

    $("#modal-select-dept").change(function (e) {
        let selectedDept = e.currentTarget.value;
        if (selectedDept !== "reset" && selectedDept !== "resetSubset") {
            let locationHunt = departments.find(
                (department) => department.id === selectedDept
            );
            $("#modal-select-loc").val(locationHunt.locationID);
        } else if (searchDept === "reset") {
            $("#modal-select-loc").val("reset");
        }
    });

    $("#modal-select-loc").change(function (e) {
        let selectedLoc = e.currentTarget.value;
        if (selectedLoc === "reset") {
            departments.forEach((department) => {
                $("#modal-select-dept").append(`<option value="${department.id}">${department.name}</option>`);
            });
        } else {
            departmentOptions = departments.filter(
                (department) => department.locationID === selectedLoc
            );
            $("#modal-select-dept").html("");
            if (departmentOptions.length > 1) {
                $("#modal-select-dept").append(`<option value="resetSubset">Select Department</option>`);
            };
            departmentOptions.forEach((departmentAtLocation) => {
                $("#modal-select-dept").append(`<option value="${departmentAtLocation.id}">${departmentAtLocation.name}</option>`);
            });
        }
    });
};

// Add or edit staff and check for any duplication
$("#update-staff").click(function () {
    newEmployee.firstName = $("forename")
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
        validateString = "The employee must be associated with a department and location.";
        validationWarning(validateString);
    } else {
        newEmployee.email = $("#email").val().toLowerCase();
        newEmployee.id !== "not assigned" ? validateField("email", newEmployee.email, 6, 40, updatePersonnel) : validateField("email", newEmployee.email, 6, 40, emailDuplicationCheck);
    };
};

const emailDuplicationCheck = () => {
    if (staticResults.find((staff) => staff.email === newEmployee.email)) {
        validateString = "There is already an employee with this email address in the company directory. Duplicates are not permitted.";
        validationWarning(validateString);
    } else {
        $("#validation-text").html("");
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
                console.log(`libs/php/insertEmployee.php: ajax call failed ${textStatus}. ${errorThrown}. ${jqXHR}`);
            },
        });
    };
};

const updatePersonnel = () => {
    $("#validation-text").html("");
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
            console.log(`libs/php/updateEmployee.php: ajax call failed ${textStatus}. ${errorThrown}. ${jqXHR}`);
        },
    });
};

const getAddConfirmation = (data) => {
    closeModal();
    initialiseData();
    $("#validation-text").html(
        `<div class="alert alert-success">
            <p>
                ${data.data[0]} has been successfully added to the company directory.
            </p>
        </div>`
    );
};

const getEditConfirmation = (data) => {
    closeModal();
    initialiseData();
    $("#validation-text").html(
        `<div class="alert alert-success">
            <p>
                ${data.data[0]}'s information has been successfully updated.
            </p>
        </div>`
    );
    $("#extra-info").modal("show");
};

// Open modal to manage departments
$("#manage-departments").click(function (event) {
    $("#verb").html("Manage");
    $("#noun").html("Departments")
    event.preventDefault();
    editDepartmentData();
});

// Add a new department
$("#update-dept").on("click", function () {
    let departmentName = $("#new-department")
    .val()
    .toLowerCase()
    .replace(/(\b[a-z](?!\s))/g, function (x) {
        return x.toUpperCase();
    });
    validateField("new department", departmentName, 2, 20, lastDepartmentCheck);
});

// Check that the new department isn't a duplicate
const lastDepartmentCheck = (departmentName) => {
    let locationID = $("#department-loc").val();
    if (locationID === "reset") {
        validateString = "The new department must be associated with a location.";
        validationWarning(validateString);
    } else if (
        departments.find((department) => department.name === departmentName)
    ) {
        validateString = `${departmentName} already exists within the company directory. Duplicates are not permitted.`;
        validationWarning(validateString);
    } else {
        let location = locations.find((location) => location.id === locationID);
        let locationName = location.name;

        $("#validation-text").html("");
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
                console.log("libs/php/insertDepartment.php: ajax call successful")
                getNewDeptConfirmation(result);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(
                    `libs/php/insertDepartment.php: ajax call failed ${textStatus}.  ${errorThrown}. ${jqXHR}`
                );
            },
        });
    }
};

// Edit and delete departments
const editDepartmentData = () => {
    $("#validation-text").html("");
    $.ajax({
        url: "libs/php/getAllDepartments.php",
        type: "GET",
        dataType: "json",
        data: "getDepartmentData",
        crossOrigin: "",
        success: function (result) {
            console.log("libs/php/getAllDepartments.php: ajax call successful")
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(
                `libs/php/getAllDepartments.php: ajax call failed ${textStatus}.  ${errorThrown}. ${jqXHR}`
            );
        },
    });

    $("#new-department").val("");

    $("#list-departments").html("");
    departments.forEach((departmentToChange) => {
        $("#list-departments").append(
            `<div class="department-flex" key=${departmentToChange.id}>
                <div class="dept-to-change">
                    <p>
                        ${departmentToChange.name}
                    </p>
                </div>
                <div class="modify-buttons-container">
                    <button id="edit${departmentToChange.id}" class="trafficlight-button edit">
                        <i class="fa-regular fa-pen-to-square"></i>
                    </button>
                    <button id="delete${departmentToChange.id}" class="trafficlight-button delete">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </div`
        );

        $("#list-departments").on("click", `#delete${departmentToChange.id}`, function () {
            $("#validation-text").html(
                `<div class="alert alert-warning">
                    <p>
                        Are you sure you want to delete the ${departmentToChange.name} department?
                    </p>
                    <div class="yes-no-container">
                        <button id="confirm-dept-delete" class="yes">
                            Yes
                        </button>
                        <button class="close no">
                            No
                        </button>
                    </div>
                </div>`
            );

            $(".close").on("click", function () {
                $("#validation-text").html("");
            });

            $("#confirm-dept-delete").on("click", function () {
                $("#validation-text").html("");
                $.ajax({
                    url: "libs/php/deleteDepartmentById.php",
                    type: "GET",
                    dataType: "json",
                    data: departmentToChange.id,
                    crossOrigin: "",
                    success: function (result) {
                        console.log("libs/php/deleteDepartmentById.php: ajax call successful")
                        deleteConfirmation(result);
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        console.log(
                            `libs/php/deleteDepartmentById.php: ajax call failed ${textStatus}.  ${errorThrown}. ${jqXHR}`
                        );
                    },
                });
            });
        });

        $("#list-departments").on("click", `#edit${departmentToChange.id}`, function () {
            $("#validation-text").html("");
            $.ajax({
                url: "libs/php/getDepartmentByID.php",
                type: "GET",
                dataType: "json",
                data: "departmentToChange.id",
                crossOrigin: "",
                success: function (result) {
                    console.log("libs/php/getDepartmentByID.php: ajax call successful")
                    editDepartmentForm(result);
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log(
                        `libs/php/getDepartmentByID.php: ajax call failed ${textStatus}.  ${errorThrown}. ${jqXHR}`
                    );
                },
            })
        });
    });

    $("#select-dept-location").html(
        `<option value="reset" selected>Select Location</option>`
    );

    locations.forEach((location) => {
        $("#select-dept-location").append(
            `<option value="${location.id}" loc-name="${location.name}">${location.name}</option>`
        );
    });

    $(".new-department-form").show();
    $("#extra-info").modal("show");
};

const editDepartmentForm = (data) => {
    let departmentToChange = data.data;

    $("#validation-text").html(
        `<div class="alert alert-warning">
            <label for="new-department-name" class="form-control-label title>
                Rename Department
            </label>
            <input type="text" id="new-department-name" class="form-contol" autocapitalize>
            <label for="new-location" class="form-control-label title">
                Location
            </label>
            <select id="new-location" class="form-select">
                <option value="reset">
                    Select Location
                </option>
            </select>
            <br>
            <button id="confirm-edit-dept" class="save-button" data=${departmentToChange.id}>
                Save
            </button>
            <button class="cancel-button close">
                Cancel
            </button>
        </div>`
    );

    locations.forEach((location) => {
        $("#new-location").append(
            `<option value="${location.id}">${location.name}</option>`
        );
    });

    $("#new-department-name").val(departmentToChange.name);
    $("#new-location").val(departmentToChange.locationID);

    $(".close").on("click", function () {
        $("#validation-text").html("");
    });

    $("#confirm-edit-dept").on("click", function () {
        locationForEditedDepartment = $("#new-location").val()
        let departmentName = $("#new-department-name")
        .val()
        .toLowerCase()
        .replace(/(\b[a-z](?!\s))/g, function (x) {
            return x.toUpperCase();
        })
        validateField("new department", departmentName, 2, 30, callUpdateDepartment, departmentToChange.id)
    });
};

const callUpdateDepartment = (department, departmentID) => {
    $("#validation-text").html("");
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
            console.log("libs/php/updateDepartment.php: ajax call successful")
            getEditConfirmation(result);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(
                `libs/php/updateDepartment.php: ajax call failed ${textStatus}.  ${errorThrown}. ${jqXHR}`
            );
        },
    });
};

const getNewDeptConfirmation = (data) => {
    initialiseData();
    closeModal();
    $("#extra-info").modal("show");
    $("#validation-text").html(
        `<div class="alert alert-success">
            <p>
                The ${data.data} department has been successfully added to the company directory.
            </p>
        </div>`
    );
};

// Open modal to manage locations
$("#manage-locations").click(function (event) {
    $("#verb").html("Manage");
    $("#noun").html("Locations")
    event.preventDefault();
    editLocationData();
});

const editLocationData = () => {
    $("#validation-text").html("");
    $.ajax({
        url: "libs/php/getAllLocations.php",
        type: "GET",
        dataType: "json",
        data: "getLocationData",
        crossOrigin: "",
        success: function (result) {
            console.log("libs/php/getAllLocations.php: ajax call successful")
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(
                `libs/php/getAllLocations.php: ajax call failed ${textStatus}.  ${errorThrown}. ${jqXHR}`
            );
        },
    });

    $("#new-location").val("");

    $("#list-locations").html("");
    locations.forEach((locationToChange) => {
        $("#list-locations").append(
            `<div class="location-flex" key=${locationToChange.id}>
                <div class="loc-to-change">
                    <p>
                        ${locationToChange.name}
                    </p>
                </div>
                <div class="modify-buttons-container">
                    <button id="edit${locationToChange.id}" class="trafficlight-button edit">
                        <i class="fa-regular fa-pen-to-square"></i>
                    </button>
                    <button id="delete${locationToChange.id}" class="trafficlight-button delete">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </div>`
        );

        $("#list-locations").on("click", `#edit${locationToChange.id}`, function () {
            $("#validation-text").html("");
            $.ajax({
                url: "libs/php/getLocationById.php",
                type: "GET",
                dataType: "json",
                data: "locationToChange.id",
                crossOrigin: "",
                success: function (result) {
                    console.log("libs/php/getLocationById.php: ajax call successful");
                    editLocationForm(result);
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log(
                        `libs/php/getLocationById.php: ajax call failed ${textStatus}.  ${errorThrown}. ${jqXHR}`
                    );
                },
            });
        });

        $("#list-locations").on("click", `#delete${locationToChange.id}`, function () {
            $("#validation-text").html(
                `<div class="alert alert-warning">
                    <p>
                        Are you sure you want to delete the ${locationToChange.name} office?
                    </p>
                    <div class="yes-no-container">
                        <button id="confirm-loc-delete" class="yes">
                            Yes
                        </button>
                        <button class="close no">
                            No
                        </button>
                    </div>
                </div>`
            );

            $(".close").on("click", function () {
                $("#validation-text").html("");
            });
            
            $("#confirm-loc-delete").on("click", function () {
                $("#validation-text").html("");
                $.ajax({
                    url: "libs/php/deleteLocationById.php",
                    type: "GET",
                    dataType: "json",
                    data: "locationToChange.id",
                    crossOrigin: "",
                    success: function (result) {
                        console.log("libs/php/deleteLocationById.php: ajax call successful");
                        deleteConfirmation(result);
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        console.log(
                            `libs/php/deleteLocationById.php: ajax call failed ${textStatus}.  ${errorThrown}. ${jqXHR}`
                        );
                    },
                });
            });
        });
    });

    $(".new-location-form").show();
    $("#extra-info").modal("show");
};

// Add a new location
$("#update-loc").on("click", function () {
    let location = $("#new-location")
    .val()
    .toLowerCase()
    .replace(/(\b[a-z](?!\s))/g, function (x) {
      return x.toUpperCase();
    });
    validateField("new location", location, 2, 20, lastLocationCheck);
});

// Check that the new location isn't a duplicate
const lastLocationCheck = (location) => {
    if (locations.find((office) => office.name === location)) {
        validateString = `${location} already exists within the company directory. Duplicates are not permitted.`;
        validationWarning(validateString);
    } else {
        $("#validation-text").html("");
        $.ajax({
            url: "libs/php/insertLocation.php",
            type: "GET",
            dataType: "json",
            data: "location",
            crossOrigin: "",
            success: function (result) {
                console.log("libs/php/insertLocation.php: ajax call successful");
                getNewLocConfirmation(result);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(
                    `libs/php/insertLocation.php: ajax call failed ${textStatus}.  ${errorThrown}. ${jqXHR}`
                );
            },
        });
    }
};

// Edit and delete locations
const editLocationForm = (data) => {
    let locationToChange = data.data;
    $("#validation-text").html(
        `<div class="alert alert-warning">
            <label for="new-location-name" class="form-control-label title>
                Rename Location
            </label>
            <input type="text" id="new-location-name" class="form-contol" autocapitalize>
            <br>
            <button id="confirm-edit-loc" class="save-button" data=${locationToChange.id}>
                Save
            </button>
            <button class="cancel-button close">
                Cancel
            </button>
        </div>`
    );

    $(".close").on("click", function () {
        $("#validation-text").html("");
    });

    $("#confirm-edit-loc").on("click", function () {
        $("#modal-select-loc").html(
            `<option value="reset" selected>Select Location</option>`
        );

        locations.forEach((locatiopn) => {
            $("#modal-select-loc").append(
                `<option value="${location.id}">${location.name}</option>`
            );
        });

        let location = $("#new-location-name")
        .val()
        .toLowerCase()
        .replace(/(\b[a-z](?!\s))/g, function (x) {
            return x.toUpperCase();
        });
        validateField("new location", location, 2, 20, lastUpdateLocationCheck, locationToChange.id);
    });
};

const lastUpdateLocationCheck = (location, locationID) => {
    if (locations.find((office) => office.name === location)) {
        validateString = `${location} already exists within the company directory. Duplicates are not permitted.`;
        validationWarning(validateString);
    } else {
        $("#validation-text").html("");
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
                console.log(
                    `libs/php/updateLocation.php: ajax call failed ${textStatus}.  ${errorThrown}. ${jqXHR}`
                );
            },
        });
    };
};

const getNewLocConfirmation = (data) => {
    initialiseData();
    closeModal();
    $("#validation-text").html(
        `<div class="alert alert-success">
            <p>
                The ${data.data} loaction has been successfully added to the company directory.
            </p>
            <p>
                Please specify any relevant departments.
            </p>
        </div>`
    );
    $("#extra-info").modal("show");
};

// Handle filter selection options
$("#search-names").on("input", function (e) {
    let nameToSearch = e.currentTarget.value.toLowerCase().trim();
    let searchData = $("#filter-dept").val() === "reset" && $("#filter-loc") === "reset" ? staticResults : searchResults;

    results = searchData.filter((result) => {
        result.fullName = result.firstName.toLowerCase() + " " + result.lastName.toLowerCase();
        return result.fullName.includes(nameToSearch);
    });

    displayStaffData(results);
});

$("#filter-dept").on("change", function (e) {
    searchDept = e.currentTarget.value;
    if (searchDept === "reset") {
        resetData()
    } else {
        displayStaffData(staticResults);
        $("#filter-dept").val("reset");
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
        displayStaffData(staticResults);
        $("#filter-loc").val("reset");
        const searchData = results;
        results = searchData.filter((result) => result.location === searchLoc);
        searchResults = results;
        displayStaffData(results);
    };
});

// Reset data
$("#reset-button").click(function () {
    resetData();
});

const resetData = () => {
    displayStaffData(staticResults);
    $("#search-names").val("");
    $("#filter-dept").val("reset");
    $("#filter-loc").val("reset");

    newEmployee = {
        firstName: "",
        lastName: "",
        department: "Select Department",
        departmentID: "reset",
        location: "Select Location",
        locationID: "reset",
        email: "",
        id: "not assigned",
    };
};

// Validate data
const validationWarning = (validateString) => {
    $("#validation-text").html("");
    $("#validation-text").html(
        `<div class="alert alert-danger">
            <p>
                <strong>Error!</strong>
                <br>
                ${validateString}
            </p>
        </div>`
    );
};

const validateField = (field, fieldInput, min, max, lastCheckCallback, extraField) => {
    if (fieldInput.length > max || fieldInput.length < min) {
        validateString = `The ${field} must be between ${min} and ${max} characters.`;
        validationWarning(validateString);
    } else {
        validatePattern(field, fieldInput, lastCheckCallback, extraField);
    };
};

const validatePattern = (field, fieldInput, lastCheckCallback, extraField) => {
    if (field === "email") {
        if (!fieldInput.match(
            /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        )) {
            validateString = `${fieldInput} does not seem to be a regularly-formatted email address.`;
            validationWarning(validateString);
        } else {
            lastCheckCallback(fieldInput);
        };
    } else {
        if (!fieldInput.match(/^[A-Za-z -]+$/)) {
            validateString = `The ${field} must not contain any unusual characters.`;
            validationWarning(validateString);
        } else {
            lastCheckCallback(fieldInput, extraField);
        };
    };
};

// Call an API using a basic function template
const callApi = (
    phpToCall,
    apiMethod,
    callbackFun,
    parameter1,
    parameter2,
    parameter3,
    parameter4,
    parameter5
) => {
    $("#validation-text").html("");
    const apiUrl = `libs/php/${phpToCall}.php`;
    $.ajax({
        url: apiUrl,
        type: apiMethod,
        dataType: "json",
        data: {
            param1: parameter1,
            param2: parameter2,
            param3: parameter3,
            param4: parameter4,
            param5: parameter5,
        },
        crossOrigin: "",
        success: function (result) {
            console.log(`${apiUrl}: ajax call successful`);
            callbackFun(result);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(
                `${apiUrl}: ajax call failed ${textStatus}.  ${errorThrown}. ${jqXHR}`
            );
        },
    });
};
