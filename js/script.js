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
    [ "build-tools", { price: 100, conflicts: [  ] } ],
    [ "npm", { price: 100, conflicts: [ ] } ]
] );

// Field requirements
const fieldRequirementsMap = new Map ( [
    [ "user_name", [ { requirement: /^.+$/,
		     message: "The name field cannot be blank." } ] ],
    [ "user_email", [ { requirement: /^.+$/,
			message: "The email field cannot be blank." },
		      { requirement: /^\w+@(\w+\.)*\w+\.\w+$/,
			message: "You must provide a valid email address" }
		    ] ],
    [ "user_cc-num", [ { requirement: /^.+$/,
			 message: "The credit card number is required." },
		       { requirement: /^\d{13,16}$/,
		       message: "You must provide a valid credit card number" } ] ],
    [ "user_zip", [ { requirement: /^.+$/,
		      message: "The zip code is required." },
		      { requirement: /^\d{5}$/,
			message: "You must provide a 5-digit zip code."} ] ] ,
    [ "user_cvv", [ { requirement: /^.+$/,
		      message: "The CVV code is required." },
		    { requirement: /^\d{3}$/,
		      message: "You must provide a 3-digit CVV code."} ] ]
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
    let element = $( this );
    if ( element.val() === "other" ) {
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

    let designElement = $( this );
    let theme = designElement.val();
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

    let element = $( this );
    let currentActivity = element.attr( "name" );
    let activityInfo = activitiesMap.get( currentActivity );
    let activityPrice = activityInfo[ 'price' ];
    let activityConflicts = activityInfo[ 'conflicts' ];

    // Need to figure out if this was toggled on or off.
    let toggledOn = element.prop('checked');

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

    let element = $( this );
    let selectedActivities = $('.activities input:checked' ).length;
    
    if ( selectedActivities === 0 ) {
	element.css('background-color', 'pink');
	let $legend = $( ".activities legend" ); 
	$legend.after( "<span class='errorMessage'>You must select at least one activity.</span>" );
    }
    else {
	element.css('background-color', '');
	$( ".activities .errorMessage" ).remove( );
    }
} );

$activities.change();

// Helper function to disable or enable a list of activities.
//
// flag says whether or not we should disable (if true) or enable (if false)
// the list of activities.
function blockActivities( list, flag ) {

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

    let currentMethod = $( this ).val();
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


// Helper function to check and see if a field is valid or not
// and, if not, return an error message.
function getFieldError( element ) {

    let fieldName = element.attr("name");
    let fieldValue = element.val();
    let fieldRequirementElements = fieldRequirementsMap.get( fieldName );

    if ( ! fieldRequirementElements ) {
	// We didn't find any requirements, so nothing to do.
	return;
    }

    for ( let i = 0; i < fieldRequirementElements.length; i++ ) {
	
	let fieldRequirement = fieldRequirementElements[ i ].requirement;
	let errorMessage = fieldRequirementElements[ i ].message;
	
	let meetsRequirement = fieldRequirement.test( fieldValue );
	if ( ! meetsRequirement ) {
	    return( errorMessage );
	}
    }

    // Looks like everything passed
    return;
}

function checkFieldValidity( event ) {
    let element = $( this );
    let errorMessage = getFieldError( element );
    
    if ( errorMessage ) {
	// Set the background to indicate the error.
	element.css('background-color', 'pink');

	// Add a new message if there isn't one already... Otherwise,
	// replace the old message.
	let currentError = element.prev().is( ".errorMessage" );
	if ( ! currentError ) {
	    element.before(  "<span class='errorMessage'>" + errorMessage + "</span>" );
	}
	else {
	    element.prev().replaceWith( "<span class='errorMessage'>" + errorMessage + "</span>" );
	}
	
    }
    else {
	element.css('background-color', '');
	element.prev().remove( ".errorMessage" );
    }
}

// Set up handlers to check whether the values of fields are
// valid or not.
$nameField.keyup( checkFieldValidity );
$emailField.keyup( checkFieldValidity );
$ccNumField.keyup( checkFieldValidity );
$ccZipField.keyup( checkFieldValidity );
$ccCvvField.keyup( checkFieldValidity );

// Force the change event to do intial validation
$nameField.keyup();
$emailField.keyup();
$ccNumField.keyup();
$ccZipField.keyup();
$ccCvvField.keyup();

// Set a handler up on the form to do validation
$( 'form' ).submit( function ( event ) {

    let nameError = getFieldError( $nameField );
    let emailError = getFieldError( $emailField );

    let activitiesError;
    let selectedActivities = $('.activities input:checked' ).length;
    if ( selectedActivities === 0 ) {
	activitiesError = "You must select at least one activity";
    }
        
    let ccRequired;
    if ( $paymentMethod.val() === "credit card" ) {
	ccRequired = true;
    }
    else {
	ccRequired = false;
    }

    let ccNumError = getFieldError( $ccNumField );
    let ccZipError = getFieldError( $ccZipField );
    let ccCvvError = getFieldError( $ccCvvField );
    
    if ( nameError || emailError || activitiesError || 
	 ( ccRequired && ( ccNumError || ccZipError || ccCvvError ) ) ) {

	event.preventDefault();
	let errorMessage = "You need to fix the following errors before you submit.";
	if ( nameError ) {
	    errorMessage += "\n - " + nameError;
	}

	if ( emailError ) {
	    errorMessage += "\n - " + emailError;
	}

	if ( activitiesError ) {
	    errorMessage += "\n - " + activitiesError;
	}

	if ( ccRequired ) {
	    if ( ccNumError ) {
		errorMessage += "\n - " + ccNumError;
	    }
	    
	    if ( ccZipError ) {
		errorMessage += "\n - " + ccZipError;
	    }
	    
	    if ( ccCvvError ) {
		errorMessage += "\n - " + ccCvvError;
	    }
	}
	
	alert( errorMessage );
	return;
    }    
} );



