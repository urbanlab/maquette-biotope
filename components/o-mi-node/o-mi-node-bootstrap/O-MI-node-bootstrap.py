import sys
import os
ODFLIB_DIR = '/home/acerioni/devel/bIoTope/ODFLib/'
sys.path.append( ODFLIB_DIR )
import datetime
from odflib import *

baseURL = 'http://example.org/'


root = Object('myTestType')
root.add_id('Rue_Garibaldi_mock-up')

leftZone = Object('myTestType')
leftZone.add_id('Left_Zone')

tree_1 = Object('myTestType')
tree_1.add_id("Tree_1")
tree_1.add_infoitem( InfoItem('Temperature').add_value(0.0, type='xsd:decimal') )
leftZone.add_object(tree_1)

valve_1 = Object('myTestType')
valve_1.add_id("Valve_1")
valve_1.add_infoitem( InfoItem('Status').add_value('OFF', type='xsd:string') )
leftZone.add_object(valve_1)

indicator_1 = Object('myTestType')
indicator_1.add_id("Indicator_1")
indicator_1.add_infoitem( InfoItem('Value').add_value('0.0', type='xsd:decimal') )
leftZone.add_object(indicator_1)

# leftZone.add_object( tree_1 )
# leftZone.add_object( valve_1 )

rightZone = Object('myTestType')
rightZone.add_id('Right_Zone')

tree_1 = Object('myTestType')
tree_1.add_id("Tree_1")
tree_1.add_infoitem( InfoItem('Temperature').add_value(0.0, type='xsd:decimal') )
#rightZone.add_infoitem( InfoItem('Indicator').add_value(0.0, type='xsd:decimal') )
rightZone.add_object(tree_1)

valve_1 = Object('myTestType')
valve_1.add_id("Valve_1")
valve_1.add_infoitem( InfoItem('Status').add_value('OFF', type='xsd:string') )
rightZone.add_object(valve_1)

indicator_1 = Object('myTestType')
indicator_1.add_id("Indicator_1")
indicator_1.add_infoitem( InfoItem('Value').add_value('0.0', type='xsd:decimal') )
rightZone.add_object(indicator_1)

# rightZone.add_object( tree_1 )
# rightZone.add_object( valve_1 )

root.add_object( leftZone )
root.add_object( rightZone )

objects = Objects()
objects.add_object( root )

omienvelope = OMIEnvelope(mode='write')
omienvelope.add_objects( objects )

#print(omienvelope)

omienvelope.write_to_file('O-MI-node-bootstrap.xml')
