import './scss/main.scss';
import './node_modules/jquery-ui/themes/base/datepicker.css';
import '@fortawesome/fontawesome-free/js/fontawesome';
import '@fortawesome/fontawesome-free/js/solid';
import '@fortawesome/fontawesome-free/js/regular';
import '@fortawesome/fontawesome-free/js/brands';
import $ from 'jquery';
import 'popper.js';
import 'bootstrap';
import 'jquery-ui/ui/widgets/datepicker';

$(document).ready(function () {    //starts the main functions used in the application
    initDatepicker();
    handleSearchForm();
    fixedTop();
    displayCurrentlyEvents();
});

function handleSearchForm() {

    //     the function eliminates the button event. When submitted, 
    //     it shows the load and changes the text "Monthly Events" to "Search Result".
    // Date entries are collected using the datepicker


    $('#searchform').on('submit', function (e) {
        e.preventDefault();
        $('#showloading').removeClass('d-none');

        $("#searchresults").html("Search Results");


        let from = $('#from').datepicker('getDate');
        let fromTimestamp = new Date(from).getTime();
        let to = $('#to').datepicker('getDate');
        let toTimestamp = new Date(to).getTime();

        // within the "if", we test the values ​​entered to confirm that the end date is greater than the start date. Giving everything correct, 
        // we clear the div where you will receive the results through the function "getEvents"

        if (fromTimestamp > toTimestamp) {
            displayFormError();
        } else {
            cleanEventsTeasers();
            getEvents(fromTimestamp, toTimestamp);
        }
    });
}

// Simple function to show and hide error message about data entered
function displayFormError() {
    $('.alert').removeClass('d-none');
    setTimeout(function () {
        $('.alert').addClass('d-none');
    }, 3000);
}


//The function clears the div to receive the search results

function cleanEventsTeasers() {
    $('.event-teaser').remove();
}

//read the data.json file with information about "events"

function getEvents(from, to) {
    $.getJSON("data.json", function (data) {
        const events = data.events;
        processRecurrence(events, from, to);
    });
}

//The function renders the html with all the information collected from the data.json file. 

function renderEventHtml(event) {
    var dateEventStart = new Date(event.start);
    var dayEvent = dateEventStart.getDate();
    if (dayEvent < 10) {

        dayEvent = '0' + dayEvent;
    }

    var eventHourStart = dateEventStart.getHours();
    var eventMinuteStart = dateEventStart.getMinutes();
    var eventHourEnd = new Date(event.end).getHours();
    var eventMinuteEnd = new Date(event.end).getMinutes()
    var monthEvent = dateEventStart.getMonth('') + 1;

    if (monthEvent < 10) {

        monthEvent = '0' + monthEvent;
    }

    if (event.category == 'Carnival') {
        var iconInsertCategory = '<i class="fas fa-mask"></i>';
    }
    else if (event.category == 'Festival') {
        var iconInsertCategory = '<i class="fas fa-music"></i>';

    }
    else if (event.category == 'Movie') {
        var iconInsertCategory = '<i class="fas fa-film"></i>';

    }
    else if (event.category == 'Fair') {
        var iconInsertCategory = '<i class="far fa-handshake"></i>';

    }

    var dataEvents = '<div  class="event-teaser col-md-6 mb-3 col-lg-3" >';
    dataEvents += '<div class="row mx-0 p-4 bg-light h-100">';
    dataEvents += '<div class="row mx-0">';
    dataEvents += '<div class="col-3 p-0 d-flex align-items-start">';
    dataEvents += '<img  class="event-image img-fluid d-block" src=./dist/img/' + event.image + '>';
    dataEvents += '</div>';
    dataEvents += '<div class="col-9">';
    dataEvents += '<h3 class="event-title">' + event.title + '</h3>';
    dataEvents += '</div>';
    dataEvents += '<div class="col-12 px-0">';
    dataEvents += '<small class="event-date mb-1   d-inline-block">' + iconInsertCategory + '     |   <i class="far fa-calendar-alt"></i>  ' + dayEvent + '/' + monthEvent + '    </small>';
    dataEvents += '<small class="event-date mb-1   d-inline-block">| ' + eventHourStart + ':' + eventMinuteStart + ' - ' + eventHourEnd + ':' + eventMinuteEnd + ' </small>';
    dataEvents += '</div>';
    dataEvents += '</div>';
    dataEvents += '<div class="col-12 px-0 ">';
    dataEvents += '<p class="event-description mb-0">' + event.description + '</p>';
    dataEvents += '</div>';
    dataEvents += '<div class="col-12 bg-gray-light col-12 mb-1 p-1 event-info ">';
    dataEvents += '<span class="event-ticket mb-0"><i class="fas fa-ticket-alt"></i> | ' + event.costs + '</span>';
    dataEvents += '</div>';
    dataEvents += '<div class="col-12 bg-gray-light col-12 mb-1 p-1 event-info ">';
    dataEvents += '<span class="event-local mb-0"><i class="fas fa-map-marker-alt"></i> | ' + event.venue.name + '</span>';
    dataEvents += '</div>';
    dataEvents += '<div class="col-12 bg-gray-light col-12 mb-1 p-1 event-info ">';
    dataEvents += '<i class="fas fa-map-marked"></i> | <a href="https://www.google.com.br/maps/place/' + event.venue.street + ',' + event.venue.city + '" class="event-local mb-0">View route</span>';
    dataEvents += '</div>';
    dataEvents += '<div class="col-12 bg-gray-light col-12 p-1 event-info ">';
    dataEvents += '<i class="fas fa-globe"></i> | <a href="' + event.link + '" class="event-info-site mb-0">Visit website</span>';
    dataEvents += '</div>';
    dataEvents += '</div>';
    dataEvents += '</div>';


    $('#resultsevents').append(dataEvents);
    $('#showloading').addClass('d-none');
}



// The function calculates the reference for each type of event ... "monthly", "annual", "daily" adding 
// to the day, month and year the respective increments according to the recurrence.

function addRecurrenceOnEvent(event) {
    let startDate = new Date(event.start);
    let endDate = new Date(event.end);

    let newStartDate = startDate;
    let newEndDate = endDate;

    if (event.recurrence == 'daily') {
        newStartDate = startDate.setDate(startDate.getDate() + 1);
        newEndDate = endDate.setDate(endDate.getDate() + 1);
    }
    if (event.recurrence == 'monthly') {
        newStartDate = startDate.setMonth(startDate.getMonth() + 1);
        newEndDate = endDate.setMonth(endDate.getMonth() + 1);
    }
    if (event.recurrence == 'yearly') {
        newStartDate = startDate.setFullYear(startDate.getFullYear() + 1);
        newEndDate = endDate.setFullYear(endDate.getFullYear() + 1);
    }

    event.start = newStartDate;
    event.end = newEndDate;

    return event;
}


function processRecurrence(events, from, to) {
    var eventsWithRecurrence = [];

    events.forEach(function (event) {
        event.start = event.start * 1000;
        event.end = event.end * 1000;


        while (event.end <= to) {
            if ((event.start >= from) && (event.end <= to)) {
                renderEventHtml(event);

            }

            if (event.recurrence != 'none') {
                event = addRecurrenceOnEvent(event);
            } else {
                break;
            };
        }
    });

    return eventsWithRecurrence;
}

function initDatepicker() {
    $('.form-datepicker').datepicker({ minDate: 0 });

}

function fixedTop() {

    $(window).scroll(function () {
        if ($(this).scrollTop() > 750) {
            $(".sectionsearch").addClass("fixed-top");
        } else {
            $(".sectionsearch").removeClass("fixed-top");
        }
    });

}

function displayCurrentlyEvents() {

    let initialDate = new Date();
    let lastDateMonth = new Date(initialDate.getFullYear(), initialDate.getMonth() + 1, 0);

    let initialDateTS = new Date(initialDate).getTime();
    let lastlDateMonthTS = new Date(lastDateMonth).getTime();

    getEvents(initialDateTS, lastlDateMonthTS);

}