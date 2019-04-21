// Script

// Mapping of themes to colors for the shirt designs
const themeColorMap = new Map( [
    [ "js puns", new Set( [ "cornflowerblue", "darkslategrey", "gold" ] ) ],
    [ "heart js", new Set( [ "tomato", "steelblue", "dimgrey" ] ) ]
] );

// Information about the activities people can register for,
const activitiesMap = new Map( [
    [ "all", { price: 200, conflicts: [] } ],
    [ "js-frameworks", { price: 100, conflicts: [ "express" ] } ],
    [ "js-libs", { price: 100, conflicts: [ "node" ] } ],
    [ "express", { price: 100, conflicts: [ "js-frameworks" ] } ],
    [ "node", { price: 100, conflicts: [ "js-libs" ] } ],
    [ "build-tools", { price: 100, conflicts: [ "npm" ] } ],
    [ "npm", { price: 100, conflicts: [ "build-tools" ] } ]
] );

// Field requirements
const fieldRequirementsMap = new Map ( [
    [ "user_name", { requirement: /^.+$/,
		     message: "The name field cannot be blank." } ],
    [ "user_email", { requirement: /^\w+@(\w+\.)*\w+\.\w+$/,
		      message: "You must provide a valid email address" } ],
    [ "user_cc-num", { requirement: /^\d{13,16}$/,
		       message: "You must provide a valid credit card number" } ],
    [ "user_zip", { requirement: /^\d{5}$/,
		    message: "You must provide a 5-digit zip code."} ],
    [ "user_cvv", { requirement: /^\d{3}$/,
		    message: "You must provide a 3-digit CVV code."} ]
] );

// Key field elements
const $nameField = $( "#name" );
const $emailField = $( "#mail" );
const $otherTitleField = $( "#other-title" );

// Current price of all of the activities
let currentPrice = 0;

// Set focus to the name field on initial load.
$( $nameField ).focus();

// Hide the other-title field on load.
$( $otherTitleField ).hide();

// Set a handler to display other role title when other is selected.
const $titleField = $( "#title" );
$( $titleField ).change( function( event ) {
    if ( event.target.value === "other" ) {
	$otherTitleField.show();
    }
    else {
	// Re-hide the field in case it was being shown.
	$otherTitleField.hide();
    }

} );

// Set a handler for the design field and change the color field
// based on what is selected.
const $designField = $( "#design" );
const $colorSelector = $( '#colors-js-puns' );
const $colorFields = $( "#color > option" );
$( $designField ).change( function(event) {

    let theme = event.target.value;
    let acceptableColors = themeColorMap.get( theme );

    if ( ! acceptableColors ) {
	// We didn't recognize the theme, so hide all colors
	$colorSelector.hide();
	return;
    }

    // We know the theme, so we can show the color selector
    $colorSelector.show();

    $colorFields.each( function( index, element ) {

	let currentColor = element.value;
	
	if ( acceptableColors.has( currentColor ) ) {
	    element.style.display="";
	    element.parentElement.selectedIndex = index;
	}
	else {
	    element.style.display="none";
	}
    } );
} );

// Get rid of the color selector until someone chooses a design.
$colorSelector.hide();

// Set a handler for the activities checkboxes.
const $activities = $( ".activities" );

// Create the price element and add it to the bottom of the activities list
const $price = $( "<p id='activity-price'>Total: $0</p>" );
$( '.activities' ).append( $price );

$activities.on( "change", "input", function( event ) {

    let currentActivity = event.target.name;
    let activityInfo = activitiesMap.get( currentActivity );
    let activityPrice = activityInfo[ 'price' ];
    let activityConflicts = activityInfo[ 'conflicts' ];

    // Need to figure out if this was toggled on or off.
    let toggledOn = event.target.checked;

    if ( toggledOn ) {
	currentPrice += activityPrice;
	blockActivities( activityConflicts, true );
    }
    else {
	currentPrice -= activityPrice;
	blockActivities( activityConflicts, false );
    }
    $price.text( "Total: $" + currentPrice );
} );

// Watch for changes at the parent
$activities.change( function(event) {

    let selectedActivities = $('.activities input:checked' ).length;

    console.log( selectedActivities );
    if ( selectedActivities === 0 ) {

    }
    else {

    }
} );


// Helper function to disable or enable a list of activities.
//
// flag says whether or not we should disable (if true) or enable (if false)
// the list of activities.
function blockActivities( list, flag ) {
    console.log( flag );

    for ( let i = 0; i < list.length; i++ ) {
	let currentActivity = $( ".activities input[name='" + list[i] + "']" );

	if ( flag ) {
	    currentActivity.attr( "disabled", true );
	    currentActivity.parent().css( 'color', 'grey' );
	}
	else {
	    currentActivity.removeAttr( "disabled" );
	    currentActivity.parent().css( 'color', '' );
	}
	console.log( currentActivity );
    }
}

const $paymentMethod = $( '#payment' );
const $creditCardDiv = $( '#credit-card' );
const $paypalDiv = $( '#paypal' );
const $bitcoinDiv = $( '#bitcoin' );
const $ccNumField = $( '#cc-num' );
const $ccZipField = $( '#zip' );
const $ccCvvField = $( '#cvv' );

$paymentMethod.change( function( event ) {

    let currentMethod = event.target.value;
    if ( currentMethod === "credit card" ) {
	$creditCardDiv.show();
	$paypalDiv.hide();
	$bitcoinDiv.hide();
    }
    else if ( currentMethod === "paypal" ) {
	$creditCardDiv.hide();
	$paypalDiv.show();
	$bitcoinDiv.hide();
    }
    else if ( currentMethod === "bitcoin" ) {
	$creditCardDiv.hide();
	$paypalDiv.show();
	$bitcoinDiv.show();
    }
    
} );

// Get rid of the placeholder payment option
$( "#payment option[value='select_method']").hide()

// Make credit card the default method and trigger the change handler
// to display the right things.
$( "#payment option[value='credit card']").attr( 'selected', true ).change();


function checkFieldValidity( event ) {
    let fieldName = event.target.name;
    let fieldValue = event.target.value;
    let fieldRequirementElement = fieldRequirementsMap.get( fieldName );

    if ( ! fieldRequirementElement ) {
	// We didn't find any requirements, so nothing to do.
	return;
    }
    let fieldRequirement = fieldRequirementElement.requirement;
    let errorMessage = fieldRequirementElement.message;

    let meetsRequirement = fieldRequirement.test( fieldValue );
    
    if ( ! meetsRequirement ) {
	event.currentTarget.style.background = 'pink';
	if ( errorMessage ) {
	    $errorElement = "<span class='errorMessage'>" + errorMessage + "</span>";
	    $( event.target ).prev().append( $errorElement );
	}
    }
    else {
	event.currentTarget.style.background = '';
	$( event.target ).prev().remove( ".errorMessage" );
    }
}

$nameField.change( function ( event ) {
    checkFieldValidity( event );
} );

// Force the change event to do intial validation
$nameField.change();


$emailField.change( function ( event ) {
    checkFieldValidity( event );
} );
$emailField.change();

$ccNumField.change( function ( event ) {
    checkFieldValidity( event );
} );
$ccNumField.change();

$ccZipField.change( function ( event ) {
    checkFieldValidity( event );
} );
$ccZipField.change();

$ccCvvField.change( function ( event ) {
    checkFieldValidity( event );
} );
$ccCvvField.change();

