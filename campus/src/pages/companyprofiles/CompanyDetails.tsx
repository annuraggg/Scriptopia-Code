import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardBody, Button, Breadcrumbs, BreadcrumbItem } from '@nextui-org/react';
import { ArrowLeft, Calendar, Users, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

interface CompanyDetail {
  id: string;
  name: string;
  lastVisit: string;
  studentsHired: number;
  averagePackage: number;
  highestPackage: number;
}

export default function CompanyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState<CompanyDetail | null>(null);

  useEffect(() => {
    // Mock data for now
    setCompany({
      id: '1',
      name: 'OmniCloud Solutions',
      lastVisit: '2025',
      studentsHired: 75,
      averagePackage: 11000000,
      highestPackage: 20000000,
    });
  }, [id]);

  if (!company) return <div>Loading...</div>;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6"
    >
      <div className="mb-6">
        <Button
          variant="light"
          startContent={<ArrowLeft size={20} />}
          onClick={() => navigate('/companyprofiles')}
        >
          Back to Companies
        </Button>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">{company.name}</h1>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardBody className="flex items-center space-x-4">
              <Calendar className="w-8 h-8 text-primary" />
              <div>
                <p className="text-small text-default-500">Last Campus Visit</p>
                <p className="text-lg font-semibold">{company.lastVisit}</p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="flex items-center space-x-4">
              <Users className="w-8 h-8 text-primary" />
              <div>
                <p className="text-small text-default-500">Students Hired</p>
                <p className="text-lg font-semibold">{company.studentsHired}</p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="flex items-center space-x-4">
              <DollarSign className="w-8 h-8 text-primary" />
              <div>
                <p className="text-small text-default-500">Highest Package</p>
                <p className="text-lg font-semibold">
                  ₹{(company.highestPackage / 100000).toFixed(1)}L
                </p>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}